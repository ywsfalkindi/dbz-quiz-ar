import useGameStore from "../store/gameStore";

type SoundType = 'click' | 'correct' | 'wrong' | 'win';

// روابط احتياطية في حال لم يحدد الأدمن أصواتاً
const fallbackSounds = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  correct: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  win: 'https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3',
};

export const playSound = async (type: SoundType) => {
  if (typeof window === 'undefined') return;

  // جلب الروابط من المتجر (الإعدادات الحالية)
  const state = useGameStore.getState();
  const configSounds = state.config.sounds || {};
  
  // تحديد الرابط: إما من الإعدادات أو الاحتياطي
  const soundUrl = configSounds[`${type}Sound` as keyof typeof configSounds] || fallbackSounds[type];

  try {
    const { Howl } = await import('howler');
    const sound = new Howl({
      src: [soundUrl],
      volume: type === 'wrong' ? 0.8 : 0.5,
      html5: true,
    });
    sound.play();
  } catch (error) {
    console.error("فشل تشغيل الصوت:", error);
  }
};