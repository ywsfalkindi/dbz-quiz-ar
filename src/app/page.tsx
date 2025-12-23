'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from './store/gameStore';
import { fetchGameQuestions, verifyAnswerAction } from './actions/gameActions';
import { playSound } from './utils/sounds'; // استدعاء الأصوات

import HealthBar from './components/HealthBar';
import QuestionCard from './components/QuestionCard';
import AnswerButton from './components/AnswerButton';
import PowerLevel from './components/PowerLevel';

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
    answerQuestion,
    resetGame,
    startGame,
    nextQuestion,
    setGameWon,
    setQuestions,
  } = useGameStore();

  const [selectedAnswerKey, setSelectedAnswerKey] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [correctAnswerKey, setCorrectAnswerKey] = useState<string | null>(null);
  
  // حالة الوميض الأحمر عند الضرر
  const [damageFlash, setDamageFlash] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      // نجلب الأسئلة فقط إذا لم تكن موجودة (للحفاظ على ال persist)
      if (status === 'playing' && questions.length === 0) {
        const fetchedQuestions = await fetchGameQuestions();
        setQuestions(fetchedQuestions);
      }
    }
    loadQuestions();
  }, [status, questions.length, setQuestions]);

  const handleStart = () => {
    startGame();
  };

  const handleRestart = () => {
    resetGame();
  };

  const handleAnswer = async (questionId: string, answerKey: string) => {
    if (isVerifying || selectedAnswerKey) return;

    playSound('click');
    setIsVerifying(true);
    setSelectedAnswerKey(answerKey);

    const { isCorrect, correctAnswerKey } = await verifyAnswerAction(questionId, answerKey);
    
    // التعامل مع المؤثرات الصوتية والبصرية
    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('wrong');
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 300); // وميض سريع
    }

    answerQuestion(isCorrect);
    setCorrectAnswerKey(correctAnswerKey);

    setTimeout(() => {
      // Use getState to prevent stale closures
      const { currentQuestionIndex: latestIndex, questions: latestQuestions } = useGameStore.getState();
      
      if (latestIndex < latestQuestions.length - 1) {
        // إذا بقيت أسئلة
        nextQuestion();
      } else {
        // انتهت اللعبة (فوز)
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

      {/* طبقة الوميض الأحمر عند الضرر */}
      {damageFlash && (
        <div className="fixed inset-0 bg-red-600 opacity-30 pointer-events-none z-50 animate-pulse" />
      )}
    </main>
  );
}