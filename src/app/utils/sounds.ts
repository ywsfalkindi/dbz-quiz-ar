// لا نستورد Howl في الأعلى لتسريع تحميل الصفحة الأولى

type SoundType = 'click' | 'correct' | 'wrong' | 'win' | 'charge';

const soundUrls = {
  click: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'],
  correct: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'],
  wrong: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'],
  win: ['https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3'],
  // صوت شحن الطاقة (جديد)
  charge: ['https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'] 
};

export const playSound = async (type: SoundType) => {
  if (typeof window === 'undefined') return;

  try {
    // استيراد ديناميكي: لن يتم تحميل المكتبة إلا عند استدعاء الدالة
    const { Howl } = await import('howler');

    const sound = new Howl({
      src: soundUrls[type],
      volume: type === 'wrong' ? 0.8 : 0.5,
      html5: true, // لتشغيل أفضل على الجوال
    });

    sound.play();
  } catch (error) {
    console.error("فشل تشغيل الصوت:", error);
  }
};