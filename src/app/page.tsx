'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { client } from '../../sanity/lib/client'
import useGameStore from './store/gameStore'

import HealthBar from './components/HealthBar'
import QuestionCard from './components/QuestionCard'
import AnswerButton from './components/AnswerButton'
import PowerLevel from './components/PowerLevel'

// Define the type for a single question fetched from Sanity
interface Question {
  _id: string;
  title: string;
  answers: {
    _key: string;
    answer: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
  image?: any;
}

const StartScreen = ({ onStart }: { onStart: () => void }) => (
  <motion.div
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
      onClick={onStart}
      className="px-12 py-6 bg-red-600 text-white text-3xl font-bold rounded-lg shadow-lg"
    >
      ابدأ القتال
    </motion.button>
  </motion.div>
);

const GameOverScreen = ({ onRestart }: { onRestart: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-screen text-center"
  >
    <h2 className="text-5xl text-red-500 font-bold mb-4">لقد هُزمت!</h2>
    <p className="text-2xl text-white mb-8">هل تريد المحاولة بكرات التنين؟</p>
    <motion.button
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      onClick={onRestart}
      className="px-10 py-4 bg-green-500 text-white text-2xl font-bold rounded-lg"
    >
      إعادة المحاولة
    </motion.button>
  </motion.div>
);

const GameWonScreen = ({ score, onRestart }: { score: number; onRestart: () => void }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-screen text-center"
    >
      <h2 className="text-6xl text-yellow-400 font-bold mb-4">لقد انتصرت!</h2>
      <p className="text-3xl text-white mb-8">مستوى طاقتك النهائي: {score}</p>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRestart}
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
    currentQuestionIndex,
    answerQuestion,
    resetGame,
    startGame,
    nextQuestion,
    setGameWon
  } = useGameStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      const query = `*[_type == "question"] | order(_createdAt asc)`;
      const fetchedQuestions: Question[] = await client.fetch(query);
      setQuestions(fetchedQuestions);
    }
    if (status === 'playing' && questions.length === 0) {
        fetchQuestions();
    }
  }, [status, questions.length]);
  
  const handleStart = () => {
    startGame();
  };

  const handleRestart = () => {
    resetGame();
    setQuestions([]); // Refetch questions for a new game
  };

  const handleAnswer = (isCorrect: boolean, answerKey: string) => {
    if (selectedAnswer) return; // Prevent multiple answers

    setSelectedAnswer(answerKey);
    answerQuestion(isCorrect);

    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            nextQuestion();
            setSelectedAnswer(null);
        } else {
            setGameWon();
        }
    }, 2000); // Wait 2 seconds before next question
  };

  if (status === 'start') {
    return <StartScreen onStart={handleStart} />;
  }

  if (status === 'lost') {
    return <GameOverScreen onRestart={handleRestart} />;
  }
  
  if (status === 'won') {
      return <GameWonScreen score={score} onRestart={handleRestart} />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-8 md:p-12 bg-black text-white">
      {status === 'playing' && currentQuestion && (
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <div className="flex justify-between items-center w-full mb-8">
            <HealthBar health={health} />
            <PowerLevel score={score} />
          </div>

          <QuestionCard question={currentQuestion.title} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {currentQuestion.answers.map((ans) => (
              <AnswerButton
                key={ans._key}
                answer={ans.answer}
                onClick={() => handleAnswer(ans.isCorrect, ans._key)}
                isCorrect={selectedAnswer ? ans.isCorrect : null}
              />
            ))}
          </div>
        </motion.div>
      )}
       {!currentQuestion && status === 'playing' && (
         <div className="text-white text-2xl">جاري تحميل الأسئلة...</div>
       )}
    </main>
  );
}
