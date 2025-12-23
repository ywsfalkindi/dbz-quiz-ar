'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../store/gameStore';

interface GameTimerProps {
  onTimeUp: () => void;
}

export default function GameTimer({ onTimeUp }: GameTimerProps) {
  const { timer, decrementTimer, status } = useGameStore();
  const maxTime = 15; // يجب أن يطابق القيمة في الـ store

  useEffect(() => {
    // يعمل المؤقت فقط أثناء اللعب
    if (status !== 'playing') return;

    // إذا انتهى الوقت، نستدعي دالة الانتهاء
    if (timer <= 0) {
      onTimeUp();
      return;
    }

    // تنقيص الوقت كل ثانية
    const interval = setInterval(() => {
      decrementTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, status, decrementTimer, onTimeUp]);

  // حساب النسبة المئوية للشريط
  const percentage = (timer / maxTime) * 100;
  
  // تغيير اللون: أخضر > أصفر > أحمر
  const color = percentage > 50 ? '#22c55e' : percentage > 20 ? '#eab308' : '#ef4444';

  return (
    <div className="w-full max-w-4xl mt-4 mb-2">
      <div className="flex justify-between text-white mb-1 font-bold px-1">
        <span>الزمن المتبقي</span>
        <span className={`${timer <= 5 ? 'text-red-500 animate-pulse' : ''}`}>
          {timer}s
        </span>
      </div>
      <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <motion.div
          className="h-full"
          initial={{ width: '100%' }}
          animate={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );
}