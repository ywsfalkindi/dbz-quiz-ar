'use server';

import { z } from 'zod'; 
import { headers } from 'next/headers';
import { client } from '@/../sanity/lib/client';
import { createClient } from 'next-sanity';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import crypto from 'crypto'; // مكتبة التشفير

// --- إعدادات الاتصال ---
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }) : null;

const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
    }) : null;

// --- أنواع البيانات ---
interface SanityQuestion {
  _id: string;
  title: string;
  image?: { _type: 'image'; asset: { _ref: string; _type: 'reference'; }; };
  explanation: string;
  answers: { _key: string; answer: string; isCorrect?: boolean }[];
}

export interface Question {
  _id: string;
  title: string;
  image?: { _type: 'image'; asset: { _ref: string; _type: 'reference'; }; };
  explanation: string;
  answers: { _key: string; answer: string }[];
}

// --- أدوات التشفير (سر المهنة) ---
const SECRET_KEY = process.env.SANITY_API_WRITE_TOKEN || 'default_secret_key_change_me';

// دالة لصنع "الختم السري" (Token)
function generateSecureToken(currentScore: number): string {
  const data = `${currentScore}-${SECRET_KEY}`;
  // نقوم بخلط البيانات بطريقة لا يمكن عكسها (Hashing)
  return crypto.createHash('sha256').update(data).digest('hex');
}

// --- الوظائف (Actions) ---

// 1. جلب الأسئلة
export const fetchGameQuestions = async (): Promise<Question[]> => {
  const questions = await client.fetch<SanityQuestion[]>(
    `*[_type == "question"]{
      _id, title, image, explanation, answers[]{ _key, answer }
    }`, {}, { cache: 'no-store' } 
  );
  // ترتيب عشوائي وحذف الإجابة الصحيحة من البيانات المرسلة للمتصفح
  return questions.sort(() => Math.random() - 0.5).map(q => ({
    ...q,
    answers: q.answers || [],
  }));
};

// 2. التحقق من الإجابة وحساب النقاط (العقل المدبر)
const verifyAnswerSchema = z.object({
  questionId: z.string(),
  answerKey: z.string(),
  currentScore: z.number(),      // النقاط الحالية التي يزعم اللاعب امتلاكها
  securityToken: z.string(),     // الختم الأمني للتأكد من صحة النقاط
  timeLeft: z.number(),          // الوقت المتبقي لحساب المكافأة
  streak: z.number(),            // التتابع لحساب المكافأة
});

export const verifyAnswerAction = async (data: unknown) => {
  // فحص الأمان: هل تحاول الإجابة بسرعة جنونية؟ (Bot Protection)
  if (ratelimit) {
    const ip = (await headers()).get("x-forwarded-for") || "unknown";
    const { success } = await ratelimit.limit(ip);
    if (!success) return { isCorrect: false, message: 'اهدأ قليلاً أيها المحارب! السرعة عالية جداً.' };
  }

  // التحقق من صحة البيانات المرسلة
  const parsed = verifyAnswerSchema.safeParse(data);
  if (!parsed.success) return { isCorrect: false, message: 'بيانات المعركة غير صحيحة.' };

  const { questionId, answerKey, currentScore, securityToken, timeLeft, streak } = parsed.data;

  // 1. التحقق من "الختم" (هل تلاعب اللاعب بالنقاط السابقة؟)
  // إذا كان الختم الذي أرسله اللاعب لا يطابق الختم الذي نصنعه الآن، فهو غشاش
  const expectedToken = generateSecureToken(currentScore);
  if (securityToken !== expectedToken) {
    return { isCorrect: false, message: 'تم اكتشاف محاولة تلاعب بالطاقة! (Invalid Token)' };
  }

  try {
    // 2. جلب الإجابة الحقيقية من الخزنة (Sanity)
    const question = await client.fetch<SanityQuestion>(
      `*[_type == "question" && _id == $questionId][0]{ explanation, answers }`,
      { questionId }
    );
    if (!question || !question.answers) throw new Error();

    const selected = question.answers.find(a => a._key === answerKey);
    const correct = question.answers.find(a => a.isCorrect === true);

    if (!selected || !correct) throw new Error();

    const isCorrect = selected.isCorrect === true;
    let newScore = currentScore;
    let newStreak = 0;

    // 3. حساب النقاط الجديد (يتم هنا في السيرفر لضمان الأمان)
    if (isCorrect) {
        const timeBonus = Math.ceil(timeLeft * 10); // مكافأة السرعة
        const streakBonus = streak * 50;            // مكافأة التتابع
        const basePoints = 100;
        newScore = currentScore + basePoints + timeBonus + streakBonus;
        newStreak = streak + 1;
    } else {
        newStreak = 0;
    }

    // 4. إنشاء ختم جديد للنقاط الجديدة
    const newSecurityToken = generateSecureToken(newScore);

    return {
      isCorrect,
      correctAnswerKey: correct._key,
      explanation: question.explanation || 'لا يوجد شرح إضافي.',
      newScore,        // نرسل النقاط المعتمدة الجديدة
      newSecurityToken,// نرسل الختم الجديد للمعركة القادمة
      newStreak
    };

  } catch {
    return { isCorrect: false, message: 'خطأ في الاتصال بكوكب كاي.' };
  }
};

// 3. المساعدة: حذف إجابتين (50/50)
export const getWrongAnswersAction = async (questionId: string): Promise<string[]> => {
  try {
    const question = await client.fetch<SanityQuestion>(
      `*[_type == "question" && _id == $questionId][0]{ answers }`,
      { questionId }
    );
    if (!question?.answers) return [];
    return question.answers
      .filter(a => !a.isCorrect)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map(a => a._key);
  } catch { return []; }
};

// 4. تسجيل النتيجة النهائية
export const submitScoreAction = async (playerName: string, score: number, securityToken: string) => {
  if (!process.env.SANITY_API_WRITE_TOKEN) return { error: 'نظام الكتابة غير مفعل' };

  // التحقق الأخير: هل النقاط التي يريد حفظها موثقة بختمنا؟
  const expectedToken = generateSecureToken(score);
  if (securityToken !== expectedToken) {
     return { error: 'محاولة غش مكشوفة! لن يتم تسجيل الرقم.' };
  }

  // تنظيف الاسم من الرموز والشتائم المحتملة (نقبل الحروف والأرقام فقط)
  const cleanName = playerName.replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, "").substring(0, 20);

  try {
    await writeClient.create({
      _type: 'leaderboard',
      playerName: cleanName || 'محارب مجهول',
      score: score,
      date: new Date().toISOString()
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: 'فشل حفظ البيانات في السجل الكوني.' };
  }
};

// 5. لوحة الصدارة
export const getLeaderboardAction = async () => {
  try {
    return await client.fetch(`
      *[_type == "leaderboard"] | order(score desc)[0...10] {
        playerName, score
      }
    `, {}, { next: { revalidate: 0 } });
  } catch { return []; }
};

// 6. الإعدادات
export const getGameConfig = async () => {
  try {
    const config = await client.fetch(`*[_type == "gameConfig"][0]{
      timerDuration, senzuCount, hintCount, isMaintenanceMode,
      thresholds, texts, theme, sounds
    }`, {}, { cache: 'no-store' });
    
    return config || { 
      timerDuration: 15, senzuCount: 1, hintCount: 1, isMaintenanceMode: false,
      thresholds: { ssj: 2500, blue: 5000, ui: 8000 },
      texts: { loadingText: '...', winTitle: 'فوز', loseTitle: 'خسارة' },
      theme: { primaryColor: '#F85B1A', secondaryColor: '#FFD600' }
    };
  } catch {
    return { timerDuration: 15, senzuCount: 1, hintCount: 1, isMaintenanceMode: false };
  }
};