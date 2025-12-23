import { Howl } from 'howler';

export const sounds = {
  // صوت النقر العادي
  click: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'],
    volume: 0.5
  }),
  
  // صوت الإجابة الصحيحة (نجاح)
  correct: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'],
    volume: 0.5
  }),
  
  // صوت الخطأ (تلقي ضربة)
  wrong: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'],
    volume: 0.8
  }),
  
  // صوت الفوز باللعبة
  win: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3'],
    volume: 0.6
  }),
};

export const playSound = (type: keyof typeof sounds) => {
  // نتأكد أن الكود يعمل في المتصفح فقط
  if (typeof window !== 'undefined') {
    sounds[type].play();
  }
};