// src/app/actions/gameActions.ts
'use server';

import { z } from 'zod'; 
import { headers } from 'next/headers';
import { client } from '@/../sanity/lib/client';
import { createClient } from 'next-sanity'; // للكتابة
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// إعداد عميل الكتابة (لحفظ النتائج)
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// إعداد Redis للحماية (اختياري حسب توفره)
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

// الأنواع
interface SanityImage {
  _type: 'image';
  asset: { _ref: string; _type: 'reference'; };
}

interface SanityQuestion {
  _id: string;
  title: string;
  image?: SanityImage;
  explanation: string;
  answers: { _key: string; answer: string; isCorrect?: boolean }[];
}

export interface Question {
  _id: string;
  title: string;
  image?: SanityImage;
  explanation: string;
  answers: { _key: string; answer: string }[];
}

// 1. جلب الأسئلة (مع منع التخزين المؤقت)
export const fetchGameQuestions = async (): Promise<Question[]> => {
  const questions = await client.fetch<SanityQuestion[]>(
    `*[_type == "question"]{
      _id,
      title,
      image,
      explanation,
      answers[]{ _key, answer }
    }`,
    {},
    { cache: 'no-store' } // إصلاح: يجبر السيرفر على جلب بيانات جديدة
  );

  return questions.sort(() => Math.random() - 0.5).map(q => ({
    ...q,
    answers: q.answers || [],
  }));
};

// 2. التحقق من الإجابة (آمن)
const verifyAnswerSchema = z.object({
  questionId: z.string(),
  answerKey: z.string(),
});

export const verifyAnswerAction = async (questionId: string, answerKey: string) => {
  // حماية من الهجمات المتكررة
  if (ratelimit) {
    const ip = (await headers()).get("x-forwarded-for") || "unknown";
    const { success } = await ratelimit.limit(ip);
    if (!success) return { isCorrect: false, correctAnswerKey: '', explanation: 'هدئ سرعتك أيها المحارب!' };
  }

  const validation = verifyAnswerSchema.safeParse({ questionId, answerKey });
  if (!validation.success) return { isCorrect: false, correctAnswerKey: '', explanation: 'خطأ في البيانات' };

  try {
    const question = await client.fetch<SanityQuestion>(
      `*[_type == "question" && _id == $questionId][0]{ explanation, answers }`,
      { questionId }
    );
    if (!question || !question.answers) throw new Error();

    const selected = question.answers.find(a => a._key === answerKey);
    const correct = question.answers.find(a => a.isCorrect === true);

    if (!selected || !correct) throw new Error();

    return {
      isCorrect: selected.isCorrect === true,
      correctAnswerKey: correct._key,
      explanation: question.explanation || 'لا يوجد شرح إضافي.',
    };
  } catch {
    return { isCorrect: false, correctAnswerKey: '', explanation: 'حدث خطأ تقني.' };
  }
};

// 3. جلب الإجابات الخاطئة (للتلميح)
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

// 4. حفظ النتيجة (مع التحقق الأمني)
export const submitScoreAction = async (playerName: string, score: number) => {
  if (!process.env.SANITY_API_WRITE_TOKEN) return;

  // إصلاح أمني: التحقق من أن النتيجة منطقية
  // نفترض أن أقصى درجة منطقية هي 25000 (يمكنك تعديلها)
  if (score > 25000 || score < 0) {
    console.error(`محاولة غش محتملة من اللاعب ${playerName} بنتيجة ${score}`);
    return; 
  }

  // تنظيف الاسم (Sanitization)
  const cleanName = playerName.replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, "").substring(0, 20);

  try {
    await writeClient.create({
      _type: 'leaderboard',
      playerName: cleanName || 'محارب مجهول',
      score: score,
      date: new Date().toISOString()
    });
  } catch (e) {
    console.error("فشل حفظ النتيجة", e);
  }
};

// 5. جلب المتصدرين
export const getLeaderboardAction = async () => {
  try {
    return await client.fetch(`
      *[_type == "leaderboard"] | order(score desc)[0...10] {
        playerName,
        score
      }
    `, {}, { next: { revalidate: 0 } }); // تحديث فوري
  } catch { return []; }
};

// 6. جلب الإعدادات
export const getGameConfig = async () => {
  try {
    const config = await client.fetch(`*[_type == "gameConfig"][0]{
      timerDuration, senzuCount, hintCount, isMaintenanceMode,
      thresholds, texts, theme, sounds
    }`, {}, { cache: 'no-store' }); // مهم جداً للتحديث الفوري
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