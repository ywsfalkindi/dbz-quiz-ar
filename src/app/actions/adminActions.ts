'use server';

import { createClient } from 'next-sanity';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { client } from '@/../sanity/lib/client';

// عميل الكتابة (يملك صلاحية التعديل)
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN, // تأكد من وجود التوكن في .env
  apiVersion: '2024-01-01',
  useCdn: false,
});

// 1. تسجيل الدخول
export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string;
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'god_mode_active', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    redirect('/admin');
  } else {
    return { error: 'كلمة المرور خاطئة! هل أنت جاسوس؟' };
  }
}

// 2. تسجيل الخروج
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/login');
}

// 3. جلب الإحصائيات الشاملة (Dashboard)
export async function getDashboardStats() {
  const [playersCount, questionsCount, bestScore, recentLogs] = await Promise.all([
    client.fetch(`count(*[_type == "leaderboard"])`),
    client.fetch(`count(*[_type == "question"])`),
    client.fetch(`*[_type == "leaderboard"] | order(score desc)[0] { playerName, score }`),
    client.fetch(`*[_type == "gameLog"] | order(timestamp desc)[0...5]`) // آخر 5 معارك
  ]);
  return { playersCount, questionsCount, bestScore, recentLogs };
}

// 4. جلب الإعدادات
export async function getGameConfig() {
  const config = await client.fetch(`*[_type == "gameConfig"][0]`);
  // قيم افتراضية في حال عدم وجود إعدادات
  return config || { 
    timerDuration: 15, 
    senzuCount: 1, 
    hintCount: 1, 
    thresholds: { ssj: 2500, blue: 5000, ui: 8000 },
    texts: { loadingText: 'جاري التحميل...', winTitle: 'فزت!', loseTitle: 'خسرت...' },
    isMaintenanceMode: false 
  };
}

// 5. تحديث الإعدادات (شاملة التحولات والنصوص)
export async function updateGameConfig(formData: FormData) {
  const config = {
    timerDuration: Number(formData.get('timerDuration')),
    senzuCount: Number(formData.get('senzuCount')),
    hintCount: Number(formData.get('hintCount')),
    thresholds: {
      ssj: Number(formData.get('ssjThreshold')),
      blue: Number(formData.get('blueThreshold')),
      ui: Number(formData.get('uiThreshold')),
    },
    texts: {
      loadingText: formData.get('loadingText'),
      winTitle: formData.get('winTitle'),
      loseTitle: formData.get('loseTitle'),
    },
    isMaintenanceMode: formData.get('isMaintenanceMode') === 'on',
  };

  const existingConfig = await client.fetch(`*[_type == "gameConfig"][0]._id`);
  if (existingConfig) {
    await writeClient.patch(existingConfig).set(config).commit();
  } else {
    await writeClient.create({ _type: 'gameConfig', ...config });
  }

  revalidatePath('/'); 
  return { success: 'تم تحديث قوانين الكون بنجاح!' };
}

// 6. إضافة سؤال جديد (CMS داخلي)
export async function createQuestionAction(formData: FormData) {
  const title = formData.get('title') as string;
  const correctAnswer = formData.get('correctAnswer') as string;
  const wrong1 = formData.get('wrong1') as string;
  const wrong2 = formData.get('wrong2') as string;
  const wrong3 = formData.get('wrong3') as string;
  const explanation = formData.get('explanation') as string;
  const imageFile = formData.get('image') as File;

  let imageAsset;
  if (imageFile && imageFile.size > 0) {
    // رفع الصورة إلى Sanity
    const asset = await writeClient.assets.upload('image', imageFile);
    imageAsset = { _type: 'image', asset: { _type: "reference", _ref: asset._id } };
  }

  // بناء هيكل السؤال
  await writeClient.create({
    _type: 'question',
    title,
    difficulty: 'z-fighter', // افتراضي
    answers: [
      { _key: 'a1', answer: correctAnswer, isCorrect: true },
      { _key: 'a2', answer: wrong1, isCorrect: false },
      { _key: 'a3', answer: wrong2, isCorrect: false },
      { _key: 'a4', answer: wrong3, isCorrect: false },
    ],
    explanation,
    image: imageAsset
  });

  revalidatePath('/admin/questions');
  return { success: 'تم إضافة السؤال إلى قاعدة البيانات!' };
}

// 7. جلب قائمة الأسئلة للإدارة
export async function getAllQuestions() {
  return await client.fetch(`*[_type == "question"] | order(_createdAt desc) { _id, title }`);
}

// 8. حذف سؤال
export async function deleteQuestionAction(id: string) {
  await writeClient.delete(id);
  revalidatePath('/admin/questions');
}

// 9. حذف لاعب
export async function deletePlayerAction(id: string) {
  await writeClient.delete(id);
  revalidatePath('/admin/users');
}

// 10. جلب اللاعبين
export async function getAllPlayers() {
  return await client.fetch(`*[_type == "leaderboard"] | order(date desc) [0...100]`);
}