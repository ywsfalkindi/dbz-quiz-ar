'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameLogic } from './hooks/useGameLogic';
import HealthBar from './components/HealthBar';
import QuestionCard from './components/QuestionCard';
import AnswerButton from './components/AnswerButton';
import GameTimer from './components/GameTimer';
import CharacterAvatar from './components/CharacterAvatar';
import GameSkeleton from './components/GameSkeleton';

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
    // الحاوية الرئيسية: ارتفاع ثابت بحجم الشاشة، وتمنع تمرير الصفحة بالكامل
    <motion.main 
      animate={damageFlash ? "shake" : "idle"}
      variants={shakeVariants}
      className="fixed inset-0 w-full h-dvh bg-black bg-space-pattern flex flex-col overflow-hidden"
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
            className="flex flex-col items-center justify-center h-full gap-8 z-10 p-4 text-center overflow-y-auto"
          >
            {/* التعديل هنا: bg-linear-to-b بدلاً من bg-gradient-to-b */}
            <h1 className="text-fluid-h1 font-black text-transparent bg-clip-text bg-linear-to-b from-dbz-yellow to-dbz-orange drop-shadow-[0_0_15px_rgba(248,91,26,0.5)]">
               دراغون كويز Z
            </h1>
            <p className="text-gray-400 text-fluid-p max-w-md px-4">
              أثبت أنك المحارب الأقوى في الكون.
              أجب بسرعة، تحول، وانتصر!
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px #F85B1A' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              /* التعديل هنا: bg-linear-to-r بدلاً من bg-gradient-to-r */
              className="px-10 py-5 bg-linear-to-r from-red-600 to-dbz-orange text-white text-2xl font-bold rounded-full shadow-lg border border-red-400 cursor-pointer"
            >
              ابدأ القتال 🔥
            </motion.button>
          </motion.div>
        )}

        {/* === شاشة اللعب (الهيكل المرن) === */}
        {status === 'playing' && (
          <motion.div
            key="game-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full w-full max-w-3xl mx-auto"
          >
            {isLoading ? (
               <div className="pt-safe-top p-6 flex-1">
                 <GameSkeleton />
               </div>
            ) : (
              <>
                {/* --- 1. القسم العلوي (ثابت) --- */}
                {/* التعديل هنا: bg-linear-to-b */}
                <div className="shrink-0 px-4 pt-safe-top pb-2 z-10 bg-linear-to-b from-black/80 to-transparent">
                  <div className="flex justify-between items-end gap-4">
                    <div className="flex-1">
                      <HealthBar health={health} />
                    </div>
                    <CharacterAvatar form={saiyanForm} />
                  </div>
                  <GameTimer onTimeUp={handleTimeUp} />
                  <div className="flex justify-between w-full text-sm font-mono text-dbz-energy px-2">
                    <span>الطاقة: {score}</span>
                    <span>الجولة: {currentQuestionIndex + 1}/{questions.length}</span>
                  </div>
                </div>

                {/* --- 2. القسم الأوسط (قابل للتمرير) --- */}
                <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide relative">
                    <QuestionCard 
                      question={currentQuestion.title} 
                      borderColor={saiyanForm.color} 
                    />
                    
                    <div className="grid grid-cols-1 gap-3 pb-4">
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
                </div>

                {/* --- 3. القسم السفلي (ثابت للأدوات) --- */}
                {/* التعديل هنا: bg-linear-to-t */}
                <div className="shrink-0 px-4 pb-safe-bottom pt-2 bg-linear-to-t from-black via-black/90 to-transparent z-20">
                  <div className="glass-panel mx-auto mb-4 p-3 rounded-2xl flex justify-center gap-6 max-w-sm">
                    {/* زر السينزو */}
                    <button
                      onClick={handleUseSenzu}
                      disabled={inventory.senzuBeans === 0 || health === 100}
                      className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all border-2 active:scale-90
                        ${inventory.senzuBeans > 0 && health < 100 
                          ? 'bg-green-600 border-green-400 shadow-[0_0_15px_#22c55e] cursor-pointer' 
                          : 'bg-gray-800 border-gray-600 opacity-50 grayscale cursor-not-allowed'}`}
                    >
                      <span className="text-2xl">💊</span>
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-black">
                        {inventory.senzuBeans}
                      </span>
                    </button>

                    {/* زر التلميح */}
                    <button
                      onClick={handleUseHint}
                      disabled={inventory.hints === 0 || hiddenAnswers.length > 0}
                      className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all border-2 active:scale-90
                        ${inventory.hints > 0 && hiddenAnswers.length === 0
                          ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_#3b82f6] cursor-pointer' 
                          : 'bg-gray-800 border-gray-600 opacity-50 grayscale cursor-not-allowed'}`}
                    >
                      <span className="text-2xl">📡</span>
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-black">
                        {inventory.hints}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* === شاشة الخسارة === */}
        {status === 'lost' && (
          <motion.div
            key="lost"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center gap-6 z-10 p-4"
          >
            <h2 className="text-fluid-h2 text-red-600 font-bold drop-shadow-lg">انتهت اللعبة</h2>
            <p className="text-xl text-white">مستواك لا يزال ضعيفاً...</p>
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
            className="flex flex-col items-center justify-center h-full text-center gap-6 z-10 p-4"
          >
            <h2 className="text-fluid-h2 text-dbz-yellow font-bold drop-shadow-[0_0_20px_#FFD600]">انتصار ساحق!</h2>
            <div className="text-8xl my-4 animate-bounce">🏆</div>
            <p className="text-2xl text-white">مستوى الطاقة النهائي: {score}</p>
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