'use server';

import { z } from 'zod'; 
import { headers } from 'next/headers';
import { client } from '@/../sanity/lib/client';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

// 1. إعداد اتصال Redis (إذا لم تتوفر المفاتيح، سيعمل بدون حماية مؤقتاً لتجنب الأخطاء أثناء التطوير)
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// السماح بـ 5 محاولات كل 10 ثواني لكل IP
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "10 s"),
    })
  : null;

// --- تعريف الأنواع ---
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

// --- 1. جلب الأسئلة ---
export const fetchGameQuestions = async (): Promise<Question[]> => {
  const questions = await client.fetch<SanityQuestion[]>(`*[_type == "question"]{
    _id,
    title,
    image,
    explanation,
    answers[]{ _key, answer }
  }`);
  
  // خلط الأسئلة عشوائياً
  return questions.sort(() => Math.random() - 0.5).map(q => ({
    ...q,
    answers: q.answers || [],
  }));
};

// --- 2. التحقق من الإجابة (محمي) ---
const verifyAnswerSchema = z.object({
  questionId: z.string().regex(/^[a-zA-Z0-9-_]+$/, "معرف غير صالح"),
  answerKey: z.string().min(1, "مفتاح الإجابة مطلوب"),
});

export const verifyAnswerAction = async (questionId: string, answerKey: string) => {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";

  // تفعيل الحماية إذا كان Redis موجوداً
  if (ratelimit) {
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return { 
        isCorrect: false, 
        correctAnswerKey: '', 
        explanation: 'لقد استنفدت طاقتك! انتظر بضع ثوانٍ قبل الهجوم التالي.' 
      };
    }
  }

  // التحقق من المدخلات (Zod)
  const validation = verifyAnswerSchema.safeParse({ questionId, answerKey });
  if (!validation.success) {
    return { isCorrect: false, correctAnswerKey: '', explanation: 'حركة غير قانونية!' };
  }

  try {
    const question = await client.fetch<SanityQuestion>(
      `*[_type == "question" && _id == $questionId][0]{ explanation, answers }`,
      { questionId }
    );

    if (!question || !question.answers) throw new Error('السؤال غير موجود');

    const selected = question.answers.find(a => a._key === answerKey);
    const correct = question.answers.find(a => a.isCorrect === true);

    if (!selected || !correct) throw new Error('البيانات ناقصة');

    return {
      isCorrect: selected.isCorrect === true,
      correctAnswerKey: correct._key,
      explanation: question.explanation || 'لا يوجد شرح إضافي.',
    };

  } catch (error) {
    console.error('خطأ التحقق:', error);
    return { isCorrect: false, correctAnswerKey: '', explanation: 'حدث خطأ تقني.' };
  }
};

// --- 3. جلب الإجابات الخاطئة (لزر التلميح) ---
export const getWrongAnswersAction = async (questionId: string): Promise<string[]> => {
  try {
    const question = await client.fetch<SanityQuestion>(
      `*[_type == "question" && _id == $questionId][0]{ answers }`,
      { questionId }
    );
    if (!question?.answers) return [];
    
    // إرجاع مفتاحين خطأ عشوائيين
    return question.answers
      .filter(a => !a.isCorrect)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map(a => a._key);
  } catch { 
  return []; 
}
};

// --- 4. حفظ النتيجة في المتصدرين (جديد) ---
// نحتاج عميل بصلاحية كتابة
import { createClient } from 'next-sanity';
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN, // يجب إضافته في .env
  apiVersion: '2024-01-01',
  useCdn: false,
});

export const submitScoreAction = async (playerName: string, score: number) => {
  if (!process.env.SANITY_API_WRITE_TOKEN) return; // حماية في حال عدم وجود التوكن

  // تنظيف الاسم من أي رموز خبيثة
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

// --- 5. جلب لوحة المتصدرين ---
export const getLeaderboardAction = async () => {
  try {
    return await client.fetch(`
      *[_type == "leaderboard"] | order(score desc)[0...5] {
        playerName,
        score
      }
    `);
  } catch { 
  return []; 
}
};