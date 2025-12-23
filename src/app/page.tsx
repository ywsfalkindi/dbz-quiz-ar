'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameLogic } from './hooks/useGameLogic';
import HealthBar from './components/HealthBar';
import QuestionCard from './components/QuestionCard';
import AnswerButton from './components/AnswerButton';
import GameTimer from './components/GameTimer';
import CharacterAvatar from './components/CharacterAvatar';

// المتغيرات الحركية للاهتزاز
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

  return (
    // الحاوية الرئيسية مع دعم المناطق الآمنة وتأثير الاهتزاز
    <motion.main 
      animate={damageFlash ? "shake" : "idle"}
      variants={shakeVariants}
      className="flex flex-col items-center min-h-dvh w-full bg-black bg-space-pattern animate-float overflow-hidden relative
                 pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right"
    >
      
      {/* طبقة الوميض الأحمر عند الضرر */}
      {damageFlash && (
        <div className="absolute inset-0 bg-red-600/30 z-50 pointer-events-none mix-blend-overlay" />
      )}

      <AnimatePresence mode="wait">
        
        {/* === شاشة البداية === */}
        {status === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="flex flex-col items-center justify-center min-h-[80dvh] gap-8 z-10 p-4 text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-b from-dbz-yellow to-dbz-orange drop-shadow-[0_0_15px_rgba(248,91,26,0.5)]">
              Dragon Quiz Z
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-md">
              أثبت أنك المحارب الأقوى في الكون. أجب بسرعة، تحول، وانتصر!
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px #F85B1A' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-10 py-5 bg-linear-to-r from-red-600 to-dbz-orange text-white text-2xl font-bold rounded-full shadow-lg border border-red-400"
            >
              ابدأ القتال 🔥
            </motion.button>
          </motion.div>
        )}

        {/* === شاشة اللعب === */}
        {status === 'playing' && currentQuestion && (
          <motion.div
            key="game-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-3xl z-10 flex flex-col items-center px-4 py-6"
          >
            {/* الهيدر: الصحة والتحول */}
            <div className="w-full flex justify-between items-end mb-6 gap-4">
              <div className="flex-1">
                 <HealthBar health={health} />
              </div>
              <CharacterAvatar form={saiyanForm} />
            </div>

            {/* المؤقت والنقاط */}
            <GameTimer onTimeUp={handleTimeUp} />
            
            <div className="flex justify-between w-full text-sm font-mono text-dbz-energy mb-2 px-2">
              <span>نقاط الطاقة : {score}</span>
              <span>الجولة : {currentQuestionIndex + 1}/{questions.length}</span>
            </div>

            {/* بطاقة السؤال */}
            <QuestionCard 
              question={currentQuestion.title} 
              borderColor={saiyanForm.color} 
            />

            {/* أزرار الإجابة */}
            <div className="w-full grid grid-cols-1 gap-3 mt-4">
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
                    isHidden={hiddenAnswers.includes(ans._key)}
                  />
                );
              })}
            </div>

            {/* شريط القوى (Power-ups) - مثبت في الأسفل للموبايل */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-4 px-4 z-20 pointer-events-none">
              <div className="pointer-events-auto flex gap-4 glass-panel p-2 rounded-full">
                {/* زر السينزو */}
                <button
                  onClick={handleUseSenzu}
                  disabled={inventory.senzuBeans === 0 || health === 100}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all border-2
                    ${inventory.senzuBeans > 0 && health < 100 
                      ? 'bg-green-600 border-green-400 shadow-[0_0_15px_#22c55e]' 
                      : 'bg-gray-800 border-gray-600 opacity-50 grayscale'}`}
                >
                  <span className="text-xl">💊</span>
                  <span className="text-[10px] font-bold absolute -top-1 -right-1 bg-red-600 w-5 h-5 rounded-full flex items-center justify-center">{inventory.senzuBeans}</span>
                </button>

                {/* زر تلميح كايو */}
                <button
                  onClick={handleUseHint}
                  disabled={inventory.hints === 0 || hiddenAnswers.length > 0}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all border-2
                    ${inventory.hints > 0 && hiddenAnswers.length === 0
                      ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_#3b82f6]' 
                      : 'bg-gray-800 border-gray-600 opacity-50 grayscale'}`}
                >
                  <span className="text-xl">📡</span>
                  <span className="text-[10px] font-bold absolute -top-1 -right-1 bg-red-600 w-5 h-5 rounded-full flex items-center justify-center">{inventory.hints}</span>
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {/* === شاشة الخسارة === */}
        {status === 'lost' && (
          <motion.div
            key="lost"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[90dvh] text-center gap-6 z-10"
          >
            <h2 className="text-6xl text-red-600 font-bold drop-shadow-lg">انتهت اللعبة</h2>
            <p className="text-2xl text-white">مستواك ضعيف جداً...</p>
            <button
              onClick={handleRestart}
              className="px-8 py-4 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform"
            >
              حاول مجدداً
            </button>
          </motion.div>
        )}

        {/* === شاشة الفوز === */}
        {status === 'won' && (
          <motion.div
            key="won"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[90dvh] text-center gap-6 z-10"
          >
            <h2 className="text-6xl text-dbz-yellow font-bold drop-shadow-[0_0_20px_#FFD600]">انتصار ساحق!</h2>
            <div className="text-8xl my-4">🏆</div>
            <p className="text-3xl text-white">مستوى الطاقة النهائي : {score}</p>
             <button
              onClick={handleRestart}
              className="px-8 py-4 bg-dbz-blue text-white font-bold text-xl rounded-full hover:scale-105 transition-transform"
            >
              معركة جديدة
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.main>
  );
}