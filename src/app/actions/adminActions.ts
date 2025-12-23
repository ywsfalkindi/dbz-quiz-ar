'use server';

import { createClient } from 'next-sanity';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// عميل Sanity للكتابة (سري جداً)
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN, // تأكد من إضافته في .env
  apiVersion: '2024-01-01',
  useCdn: false,
});

// عميل للقراءة
import { client } from '@/../sanity/lib/client';

// 1. تسجيل الدخول (نظام حماية بسيط وقوي)
export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string;
  
  // التحقق من كلمة المرور الموجودة في ملف .env
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    // نزرع "كوكي" في المتصفح يثبت أنك الأدمن
    cookieStore.set('admin_session', 'super_saiyan_access', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // صلاحية يوم واحد
      path: '/',
    });
    redirect('/admin');
  } else {
    return { error: 'كلمة المرور خاطئة! هل أنت فريزا؟' };
  }
}

// 2. تسجيل الخروج
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/login');
}

// 3. جلب إحصائيات لوحة التحكم
export async function getDashboardStats() {
  // نجلب البيانات بالتوازي لسرعة خارقة
  const [playersCount, questionsCount, bestScore] = await Promise.all([
    client.fetch(`count(*[_type == "leaderboard"])`),
    client.fetch(`count(*[_type == "question"])`),
    client.fetch(`*[_type == "leaderboard"] | order(score desc)[0] { playerName, score }`)
  ]);

  return { playersCount, questionsCount, bestScore };
}

// 4. جلب الإعدادات الحالية
export async function getGameConfig() {
  // نبحث عن أول وثيقة إعدادات، إذا لم توجد ننشئ واحدة افتراضية
  const config = await client.fetch(`*[_type == "gameConfig"][0]`);
  return config || { 
    timerDuration: 15, 
    senzuCount: 1, 
    hintCount: 1, 
    isMaintenanceMode: false 
  };
}

// 5. تحديث الإعدادات
export async function updateGameConfig(formData: FormData) {
  const config = {
    timerDuration: Number(formData.get('timerDuration')),
    senzuCount: Number(formData.get('senzuCount')),
    hintCount: Number(formData.get('hintCount')),
    isMaintenanceMode: formData.get('isMaintenanceMode') === 'on',
  };

  // نبحث عن الوثيقة لتحديثها أو ننشئها
  const existingConfig = await client.fetch(`*[_type == "gameConfig"][0]._id`);
  
  if (existingConfig) {
    await writeClient.patch(existingConfig).set(config).commit();
  } else {
    await writeClient.create({ _type: 'gameConfig', ...config });
  }

  revalidatePath('/'); // تحديث الموقع فوراً
  return { success: 'تم تحديث قوانين الكون بنجاح!' };
}

// 6. حذف لاعب (للمخالفين)
export async function deletePlayerAction(playerId: string) {
  await writeClient.delete(playerId);
  revalidatePath('/admin/users');
}

// 7. جلب كل اللاعبين للإدارة
export async function getAllPlayers() {
  return await client.fetch(`*[_type == "leaderboard"] | order(date desc) [0...100] {
    _id,
    playerName,
    score,
    date
  }`);
}