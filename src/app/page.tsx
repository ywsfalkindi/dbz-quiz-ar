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
    selectedAnswerKey, isVerifying, correctAnswerKey, damageFlash, hiddenAnswers, saiyanForm
  } = useGameLogic();

  const currentQuestion = questions[currentQuestionIndex];
  const isLoading = status === 'playing' && !currentQuestion;

  return (
    <motion.main 
      animate={damageFlash ? "shake" : "idle"}
      variants={shakeVariants}
      className="fixed inset-0 w-full h-dvh bg-black bg-space-pattern flex flex-col overflow-hidden font-sans"
    >
      {/* وميض الضرر الأحمر */}
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