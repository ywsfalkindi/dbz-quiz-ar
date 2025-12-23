'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from './store/gameStore';
import { fetchGameQuestions, verifyAnswerAction, getWrongAnswersAction } from './actions/gameActions'; // <-- إضافة getWrongAnswersAction
import { playSound } from './utils/sounds';

import HealthBar from './components/HealthBar';
import QuestionCard from './components/QuestionCard';
import AnswerButton from './components/AnswerButton';
import PowerLevel from './components/PowerLevel';
import GameTimer from './components/GameTimer';

const StartScreen = ({ onStart }: { onStart: () => void }) => (
  <motion.div
    key="start"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="flex flex-col items-center justify-center h-screen"
  >
    <h1 className="text-6xl font-bold text-white mb-8" style={{ fontFamily: "'Cairo', sans-serif" }}>
      اختبار دراغون بول
    </h1>
    <motion.button
      whileHover={{ scale: 1.1, boxShadow: '0 0 20px #ef4444' }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        playSound('click');
        onStart();
      }}
      className="px-12 py-6 bg-red-600 text-white text-3xl font-bold rounded-lg shadow-lg"
    >
      ابدأ القتال
    </motion.button>
  </motion.div>
);

const GameOverScreen = ({ onRestart }: { onRestart: () => void }) => (
  <motion.div
    key="lost"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className="flex flex-col items-center justify-center h-screen text-center"
  >
    <h2 className="text-5xl text-red-500 font-bold mb-4">لقد هُزمت!</h2>
    <p className="text-2xl text-white mb-8">هل تريد المحاولة بكرات التنين؟</p>
    <motion.button
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        playSound('click');
        onRestart();
      }}
      className="px-10 py-4 bg-green-500 text-white text-2xl font-bold rounded-lg"
    >
      إعادة المحاولة
    </motion.button>
  </motion.div>
);

const GameWonScreen = ({ score, onRestart }: { score: number; onRestart: () => void }) => (
  <motion.div
    key="won"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.5 }}
    className="flex flex-col items-center justify-center h-screen text-center"
  >
    <h2 className="text-6xl text-yellow-400 font-bold mb-4">لقد انتصرت!</h2>
    <p className="text-3xl text-white mb-8">مستوى طاقتك النهائي: {score}</p>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        playSound('click');
        onRestart();
      }}
      className="px-10 py-4 bg-blue-500 text-white text-2xl font-bold rounded-lg"
    >
      العب مرة أخرى
    </motion.button>
  </motion.div>
);

export default function Home() {
  const {
    status,
    health,
    score,
    questions,
    currentQuestionIndex,
    inventory, // <-- المخزون
    answerQuestion,
    resetGame,
    startGame,
    nextQuestion,
    setGameWon,
    setQuestions,
    useSenzuBean: applySenzu, // أعد التسمية هنا
    decrementHint: applyHint, // أعد التسمية هنا
  } = useGameStore();

  const [selectedAnswerKey, setSelectedAnswerKey] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [correctAnswerKey, setCorrectAnswerKey] = useState<string | null>(null);
  const [damageFlash, setDamageFlash] = useState(false);
  
  // --- إضافة جديدة: حالة الإجابات المخفية ---
  const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([]);

  useEffect(() => {
    async function loadQuestions() {
      if (status === 'playing' && questions.length === 0) {
        const fetchedQuestions = await fetchGameQuestions();
        setQuestions(fetchedQuestions);
      }
    }
    loadQuestions();
  }, [status, questions.length, setQuestions]);

  // تصفير الإجابات المخفية عند تغيير السؤال
  useEffect(() => {
    setHiddenAnswers([]);
  }, [currentQuestionIndex]);

  const handleStart = () => {
    startGame();
  };

  const handleRestart = () => {
    resetGame();
  };

  // --- دوال القوى المساعدة ---
  const handleUseSenzu = () => {
  if (inventory.senzuBeans > 0 && health < 100) {
    playSound('correct'); 
    applySenzu(); // استخدم الاسم الجديد بدلاً من useSenzuBean
  }
};

  const handleUseHint = async () => {
    // نتحقق من توفر التلميح وعدم استخدامه مسبقاً للسؤال الحالي
    if (inventory.hints > 0 && hiddenAnswers.length === 0 && currentQuestion && !isVerifying) {
      const wrongKeys = await getWrongAnswersAction(currentQuestion._id);
      if (wrongKeys.length > 0) {
        playSound('click');
        setHiddenAnswers(wrongKeys);
        applyHint();
      }
    }
  };
  // -------------------------

  const handleTimeUp = () => {
    if (isVerifying || selectedAnswerKey) return; 

    playSound('wrong');
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 300);
    
    answerQuestion(false); 

    setTimeout(() => {
       const { currentQuestionIndex: latestIndex, questions: latestQuestions } = useGameStore.getState();
       if (latestIndex < latestQuestions.length - 1) {
         nextQuestion();
       } else {
         if (useGameStore.getState().health > 0) {
             setGameWon();
         }
       }
    }, 1500);
  };

  const handleAnswer = async (questionId: string, answerKey: string) => {
    if (isVerifying || selectedAnswerKey) return;

    playSound('click');
    setIsVerifying(true);
    setSelectedAnswerKey(answerKey);

    const { isCorrect, correctAnswerKey } = await verifyAnswerAction(questionId, answerKey);
    
    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('wrong');
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 300);
    }

    answerQuestion(isCorrect);
    setCorrectAnswerKey(correctAnswerKey);

    setTimeout(() => {
      const { currentQuestionIndex: latestIndex, questions: latestQuestions } = useGameStore.getState();
      
      if (latestIndex < latestQuestions.length - 1) {
        nextQuestion();
      } else {
        if (useGameStore.getState().health > 0) {
             playSound('win');
             setGameWon();
        }
      }
      
      setSelectedAnswerKey(null);
      setIsVerifying(false);
      setCorrectAnswerKey(null);
    }, 2000);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-8 md:p-12 bg-black text-white relative overflow-hidden">
      <AnimatePresence mode="wait">
        {status === 'start' && (
          <StartScreen onStart={handleStart} />
        )}

        {status === 'lost' && (
          <GameOverScreen onRestart={handleRestart} />
        )}
        
        {status === 'won' && (
          <GameWonScreen score={score} onRestart={handleRestart} />
        )}

        {status === 'playing' && currentQuestion && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl z-10"
          >
            <div className="flex justify-between items-center w-full mb-8">
              <HealthBar health={health} />
              <PowerLevel score={score} />
            </div>

            <GameTimer onTimeUp={handleTimeUp} /> 
            
            {/* --- شريط القوى المساعدة (Power-ups Bar) --- */}
            <div className="flex justify-center gap-4 mb-4 w-full max-w-2xl">
              
              {/* زر السينزو بين */}
              <button
                onClick={handleUseSenzu}
                disabled={inventory.senzuBeans === 0 || health === 100}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all
                  ${inventory.senzuBeans > 0 && health < 100 
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_#22c55e]' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                <span>💊 Senzu</span>
                <span className="bg-black bg-opacity-30 px-2 rounded-full">{inventory.senzuBeans}</span>
              </button>

              {/* زر تلميح كايو */}
              <button
                onClick={handleUseHint}
                disabled={inventory.hints === 0 || hiddenAnswers.length > 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all
                  ${inventory.hints > 0 && hiddenAnswers.length === 0
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_#3b82f6]' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                <span>📡 King Kai</span>
                <span className="bg-black bg-opacity-30 px-2 rounded-full">{inventory.hints}</span>
              </button>

            </div>
            {/* ------------------------------------------- */}

            <QuestionCard question={currentQuestion.title} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {currentQuestion.answers.map((ans) => {
                let buttonState: boolean | null = null;
                if (selectedAnswerKey) {
                  if (ans._key === correctAnswerKey) buttonState = true;
                  else if (ans._key === selectedAnswerKey) buttonState = false;
                }

                return (
                  <AnswerButton
                    key={ans._key}
                    answer={ans.answer}
                    onClick={() => handleAnswer(currentQuestion._id, ans._key)}
                    isCorrect={buttonState}
                    disabled={isVerifying || !!selectedAnswerKey}
                    isHidden={hiddenAnswers.includes(ans._key)} // <-- تمرير الخاصية
                  />
                );
              })}
            </div>
            {isVerifying && <div className="text-white text-xl mt-4">يتم التحقق...</div>}
          </motion.div>
        )}
        
        {status === 'playing' && !currentQuestion && (
          <div key="loading" className="text-white text-2xl">جاري تحميل الأسئلة...</div>
        )}
      </AnimatePresence>

      {damageFlash && (
        <div className="fixed inset-0 bg-red-600 opacity-30 pointer-events-none z-50 animate-pulse" />
      )}
    </main>
  );
}