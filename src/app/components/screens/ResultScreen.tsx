// src/app/components/screens/ResultScreen.tsx
'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { submitScoreAction, getLeaderboardAction } from '@/app/actions/gameActions';

interface ResultScreenProps {
  status: 'won' | 'lost';
  score: number;
  onRestart: () => void;
}

export default function ResultScreen({ status, score, onRestart }: ResultScreenProps) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{playerName:string, score:number}[]>([]);

  // تحميل المتصدرين عند الفوز
  useEffect(() => {
    if (status === 'won') {
      getLeaderboardAction().then(data => setLeaderboard(data));
    }
  }, [status]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitted(true);
    await submitScoreAction(name, score);
    const newList = await getLeaderboardAction();
    setLeaderboard(newList);
  };

  const isWin = status === 'won';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full text-center gap-6 z-10 p-4 overflow-y-auto"
    >
      <h2 className={`text-fluid-h2 font-bold drop-shadow-lg ${isWin ? 'text-dbz-yellow' : 'text-red-600'}`}>
        {isWin ? 'انتصار أسطوري!' : 'هزيمة ساحقة...'}
      </h2>
      
      <div className="text-6xl animate-bounce">{isWin ? '🏆' : '💀'}</div>
      
      <div className="text-2xl text-white">
        مستوى الطاقة النهائي: <span className="font-mono text-dbz-energy">{score}</span>
      </div>

      {isWin && !submitted && (
        <div className="flex gap-2 w-full max-w-xs">
          <input 
            type="text" 
            placeholder="اكتب اسمك يا بطل" 
            className="flex-1 p-2 rounded text-black font-bold text-center"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={15}
          />
          <button 
            onClick={handleSubmit}
            className="bg-green-600 px-4 py-2 rounded font-bold hover:bg-green-500"
          >
            حفظ
          </button>
        </div>
      )}

      {isWin && leaderboard.length > 0 && (
        <div className="w-full max-w-xs bg-black/50 p-4 rounded-xl border border-white/10">
          <h3 className="text-dbz-orange font-bold mb-2">أقوى المحاربين</h3>
          <div className="flex flex-col gap-2 text-sm">
            {leaderboard.map((player, idx) => (
              <div key={idx} className="flex justify-between border-b border-white/5 pb-1">
                <span>{idx+1}. {player.playerName}</span>
                <span className="font-mono text-yellow-400">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onRestart}
        className={`px-8 py-4 font-bold text-xl rounded-full hover:scale-105 transition-transform ${isWin ? 'bg-dbz-blue text-white' : 'bg-white text-black'}`}
      >
        {isWin ? 'معركة جديدة' : 'حاول مجدداً'}
      </button>
    </motion.div>
  );
}