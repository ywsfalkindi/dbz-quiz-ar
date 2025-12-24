'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../store/gameStore';

interface GameTimerProps {
  onTimeUp: () => void;
}

export default function GameTimer({ onTimeUp }: GameTimerProps) {
  const { timer, syncTimer, status, config } = useGameStore();
  const maxTime = config.timerDuration; 

  useEffect(() => {
    if (status !== 'playing') return;

    // إذا انتهى الوقت، بلغ الحكم
    if (timer <= 0) {
      onTimeUp();
      return;
    }

    // تحقق من الوقت كل 200 جزء من الثانية لدقة أعلى
    const interval = setInterval(() => {
      syncTimer(); // استدعاء دالة المزامنة الحقيقية
    }, 200);

    return () => clearInterval(interval);
  }, [timer, status, syncTimer, onTimeUp]);

  // حساب النسبة المئوية
  // نستخدم Math.min لضمان ألا تزيد النسبة عن 100 في حال وجود خلل بسيط
  const percentage = Math.min(100, Math.max(0, (timer / maxTime) * 100));
  
  const color = percentage > 50 ? '#22c55e' : percentage > 20 ? '#eab308' : '#ef4444';

  return (
    <div className="w-full max-w-4xl mt-4 mb-2">
      <div className="flex justify-between text-white mb-1 font-bold px-1 font-cairo">
        <span>الزمن المتبقي</span>
        <span className={`dir-ltr ${timer <= 5 ? 'text-red-500 animate-pulse' : ''}`}>
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
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </div>
    </div>
  );
}