'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameLogic } from './hooks/useGameLogic';
import StartScreen from './components/screens/StartScreen';
import GameScreen from './components/screens/GameScreen';
import ResultScreen from './components/screens/ResultScreen';

const shakeVariants = {
  idle: { x: 0 },
  shake: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } }
};

export default function Home() {
  const {
    status, health, score, questions, currentQuestionIndex, inventory,
    handleStart, handleRestart, handleAnswer, handleTimeUp, handleUseSenzu, handleUseHint,
    selectedAnswerKey, isVerifying, correctAnswerKey, damageFlash, hiddenAnswers, saiyanForm, isConfigLoaded
  } = useGameLogic();

  const currentQuestion = questions[currentQuestionIndex];
  const isLoading = status === 'playing' && !currentQuestion;

  // شاشة الصيانة
  if (status === 'maintenance') {
    return (
        <div className="fixed inset-0 w-full h-dvh bg-black flex flex-col items-center justify-center text-center p-6 bg-space-pattern">
            <h1 className="text-4xl font-bold text-dbz-orange mb-4">⚠️ منطقة تدريب مغلقة</h1>
            <p className="text-white text-xl">جوكو وفيجيتا يدمران المكان حالياً... عد لاحقاً!</p>
            <div className="mt-8 text-6xl animate-pulse">🚧</div>
        </div>
    )
  }

  // شاشة التحميل الأولية
  if (!isConfigLoaded) {
     return <div className="fixed inset-0 bg-black flex items-center justify-center text-white">جاري استشعار الطاقة...</div>
  }

  return (
    <motion.main 
      animate={damageFlash ? "shake" : "idle"}
      variants={shakeVariants}
      className="fixed inset-0 w-full h-dvh bg-black bg-space-pattern flex flex-col overflow-hidden font-sans"
    >
      {damageFlash && (
        <div className="absolute inset-0 bg-red-600/30 z-50 pointer-events-none mix-blend-overlay" />
      )}

      <AnimatePresence mode="wait">
        
        {status === 'start' && (
          <StartScreen key="start" onStart={handleStart} />
        )}

        {status === 'playing' && (
          <GameScreen
            key="game"
            isLoading={isLoading}
            health={health}
            score={score}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            question={currentQuestion}
            saiyanForm={saiyanForm}
            inventory={inventory}
            hiddenAnswers={hiddenAnswers}
            selectedAnswerKey={selectedAnswerKey}
            isVerifying={isVerifying}
            correctAnswerKey={correctAnswerKey}
            onTimeUp={handleTimeUp}
            onAnswer={handleAnswer}
            onUseSenzu={handleUseSenzu}
            onUseHint={handleUseHint}
          />
        )}

        {(status === 'won' || status === 'lost') && (
          <ResultScreen 
            key="result" 
            status={status} 
            score={score} 
            onRestart={handleRestart} 
          />
        )}

      </AnimatePresence>
    </motion.main>
  );
}