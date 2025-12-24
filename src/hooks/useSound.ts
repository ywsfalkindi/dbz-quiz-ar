import { useEffect, useRef } from 'react';
import useGameStore from '@/app/store/gameStore';

// هذا هو "خطاف" الصوت (Hook). وظيفته تجهيز الأصوات وتشغيلها عند الطلب.
export default function useSound() {
  // نستخدم useRef لنحتفظ بنسخة من مشغل الصوت لا تتغير مع كل تحديث للشاشة
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const soundRef = useRef<any>(null);

  // نجلب إعدادات الصوت التي وضعها "الأدمن" في لوحة التحكم
  const soundsConfig = useGameStore(state => state.config.sounds);

  useEffect(() => {
    // هنا يحدث السحر! نقوم باستدعاء مكتبة howler فقط عندما يعمل الموقع داخل المتصفح
    // هذا يمنع أخطاء السيرفر (Server-Side Errors)
    import('howler').then(({ Howl }) => {
      
      // روابط احتياطية في حال نسي الأدمن وضع روابط للأصوات
      // لاحظ: استخدمنا روابط سريعة ومجانية
      const defaultSounds = {
        click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
        correct: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
        wrong: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
        win: 'https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3',
      };

      // إعداد المشغل
      soundRef.current = {
        click: new Howl({ src: [soundsConfig?.clickSound || defaultSounds.click], volume: 0.5 }),
        correct: new Howl({ src: [soundsConfig?.correctSound || defaultSounds.correct], volume: 0.5 }),
        wrong: new Howl({ src: [soundsConfig?.wrongSound || defaultSounds.wrong], volume: 0.8 }),
        win: new Howl({ src: [soundsConfig?.winSound || defaultSounds.win], volume: 0.6 }),
      };
    });
  }, [soundsConfig]); // نعيد التحميل فقط إذا تغيرت الإعدادات من الأدمن

  // هذه الدالة التي ستستخدمها في باقي الملفات لتشغيل الصوت
  const play = (type: 'click' | 'correct' | 'wrong' | 'win') => {
    if (soundRef.current && soundRef.current[type]) {
      // نوقف الصوت القديم (إن وجد) قبل تشغيل الجديد لمنع التداخل المزعج
      soundRef.current[type].stop(); 
      soundRef.current[type].play();
    }
  };

  return play;
}