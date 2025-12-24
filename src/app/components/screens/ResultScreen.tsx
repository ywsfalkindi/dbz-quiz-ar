'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { submitScoreAction, getLeaderboardAction } from '@/app/actions/gameActions';
import useGameStore from '@/app/store/gameStore';

interface ResultScreenProps {
  status: 'won' | 'lost';
  score: number;
  onRestart: () => void;
}

export default function ResultScreen({ status, score, onRestart }: ResultScreenProps) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [leaderboard, setLeaderboard] = useState<{playerName:string, score:number}[]>([]);
  
  // نجلب التوكن من المتجر
  const securityToken = useGameStore(state => state.securityToken);

  useEffect(() => {
    if (status === 'won') {
      getLeaderboardAction().then(data => setLeaderboard(data));
    }
  }, [status]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitted(true);
    
    // نرسل السكور مع التوكن للتحقق
    const result = await submitScoreAction(name, score, securityToken);
    
    if (result.error) {
        setErrorMsg(result.error);
        setSubmitted(false);
    } else {
        const newList = await getLeaderboardAction();
        setLeaderboard(newList);
    }
  };

  const isWin = status === 'won';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full text-center gap-6 z-10 p-4 overflow-y-auto w-full font-cairo"
    >
      <h2 className={`text-fluid-h2 font-black drop-shadow-lg ${isWin ? 'text-dbz-yellow' : 'text-red-600'}`}>
        {isWin ? '🎉 انتصار أسطوري!' : '💀 هزيمة ساحقة...'}
      </h2>
      
      <div className="text-6xl animate-bounce">{isWin ? '🏆' : '💔'}</div>
      
      <div className="glass-panel p-6 rounded-2xl w-full max-w-sm">
        <p className="text-gray-400 mb-2">مستوى الطاقة النهائي</p>
        <div className="text-5xl font-mono text-dbz-energy font-bold">{score}</div>
      </div>

      {isWin && !submitted && (
        <div className="flex flex-col gap-2 w-full max-w-xs animate-pulse-fast">
            <p className="text-sm text-yellow-400">سجل اسمك في تاريخ الكون!</p>
            <div className="flex gap-2">
            <input 
                type="text" 
                placeholder="اسم المحارب..." 
                className="flex-1 p-3 rounded-lg text-black font-bold text-center outline-none border-2 border-dbz-orange focus:border-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={15}
            />
            <button 
                onClick={handleSubmit}
                className="bg-green-600 px-6 py-2 rounded-lg font-bold hover:bg-green-500 text-white shadow-lg"
            >
                حفظ
            </button>
            </div>
            {errorMsg && <p className="text-red-500 text-sm font-bold">{errorMsg}</p>}
        </div>
      )}

      {isWin && leaderboard.length > 0 && (
        <div className="w-full max-w-xs bg-black/50 p-4 rounded-xl border border-white/10 max-h-40 overflow-y-auto">
          <h3 className="text-dbz-orange font-bold mb-2 sticky top-0 bg-black/80 pb-2">📜 لوحة الشرف</h3>
          <div className="flex flex-col gap-2 text-sm">
            {leaderboard.map((player, idx) => (
              <div key={idx} className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-white">{idx+1}. {player.playerName}</span>
                <span className="font-mono text-yellow-400">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onRestart}
        className={`px-10 py-4 font-bold text-xl rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] ${isWin ? 'bg-dbz-blue text-white' : 'bg-white text-black'}`}
      >
        {isWin ? 'معركة جديدة ⚔️' : 'إعادة المحاولة 🔄'}
      </button>
    </motion.div>
  );
}