// src/hooks/useSound.ts
import { useEffect, useRef } from 'react';
import useGameStore from '@/app/store/gameStore';

export default function useSound() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const soundRef = useRef<any>(null);
  // نجلب روابط الأصوات من الإعدادات
  const soundsConfig = useGameStore(state => state.config.sounds);

  // نجهز مكتبة الصوت مرة واحدة عند تشغيل اللعبة
  useEffect(() => {
    import('howler').then(({ Howl }) => {
      soundRef.current = {
        click: new Howl({ src: [soundsConfig?.clickSound || 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'] }),
        correct: new Howl({ src: [soundsConfig?.correctSound || 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'] }),
        wrong: new Howl({ src: [soundsConfig?.wrongSound || 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'] }),
        win: new Howl({ src: [soundsConfig?.winSound || 'https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3'] }),
      };
    });
  }, [soundsConfig]);

  const play = (type: 'click' | 'correct' | 'wrong' | 'win') => {
    if (soundRef.current && soundRef.current[type]) {
      soundRef.current[type].play();
    }
  };

  return play;
}