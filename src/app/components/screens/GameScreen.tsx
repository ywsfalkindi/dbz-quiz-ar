'use client';
import { motion } from 'framer-motion';
import GameSkeleton from '../GameSkeleton';
import HealthBar from '../HealthBar';
import CharacterAvatar from '../CharacterAvatar';
import GameTimer from '../GameTimer';
import QuestionCard from '../QuestionCard';
import AnswerButton from '../AnswerButton';
import { Question } from '@/app/actions/gameActions';
import { SaiyanForm } from '@/app/store/gameStore';

interface GameScreenProps {
  isLoading: boolean;
  health: number;
  score: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  question: Question;
  saiyanForm: { form: SaiyanForm; color: string; label: string };
  inventory: { senzuBeans: number; hints: number };
  hiddenAnswers: string[];
  selectedAnswerKey: string | null;
  isVerifying: boolean;
  correctAnswerKey: string | null;
  onTimeUp: () => void;
  onAnswer: (qId: string, k: string) => void;
  onUseSenzu: () => void;
  onUseHint: () => void;
}

export default function GameScreen(props: GameScreenProps) {
  
  // شاشة التحميل
  if (props.isLoading || !props.question) {
    return (
        <div className="p-6 h-full flex items-center justify-center">
            <GameSkeleton />
        </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full w-full max-w-3xl mx-auto"
    >
      {/* الشريط العلوي */}
      <div className="shrink-0 px-4 pt-safe-top pb-2 z-10 bg-linear-to-b from-black/80 to-transparent">
        <div className="flex justify-between items-end gap-4">
          <div className="flex-1"><HealthBar health={props.health} /></div>
          <CharacterAvatar form={props.saiyanForm} />
        </div>
        
        <GameTimer onTimeUp={props.onTimeUp} />
        
        <div className="flex justify-between w-full text-sm font-bold font-cairo text-dbz-energy px-2 mt-1" dir="rtl">
          <span>نقاط الطاقة: {props.score}</span>
          <span>التحدي: {props.currentQuestionIndex + 1} من {props.totalQuestions}</span>
        </div>
      </div>

      {/* منطقة السؤال */}
      <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide relative">
        <QuestionCard 
          question={props.question.title} 
          image={props.question.image} 
          borderColor={props.saiyanForm.color} 
        />
        
        {/* شبكة الإجابات */}
        <div className="grid grid-cols-1 gap-3 pb-4">
          {props.question.answers.map((ans) => {
            let state: boolean | null = null;
            if (props.selectedAnswerKey) {
              if (ans._key === props.correctAnswerKey) state = true;
              else if (ans._key === props.selectedAnswerKey) state = false;
            }
            return (
              <AnswerButton
                key={ans._key}
                answer={ans.answer}
                onClick={() => props.onAnswer(props.question._id, ans._key)}
                isCorrect={state}
                disabled={props.isVerifying || !!props.selectedAnswerKey}
                isHidden={props.hiddenAnswers.includes(ans._key)}
              />
            );
          })}
        </div>
      </div>

      {/* أدوات المساعدة */}
      <div className="shrink-0 px-4 pb-safe-bottom pt-2 bg-linear-to-t from-black via-black/90 to-transparent z-20">
        <div className="glass-panel mx-auto mb-4 p-3 rounded-2xl flex justify-center gap-6 max-w-sm">
          
          {/* زر السينزو */}
          <button
            onClick={props.onUseSenzu}
            disabled={props.inventory.senzuBeans === 0 || props.health === 100}
            aria-label="استخدام حبة سينزو"
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all border-2 active:scale-90 ${props.inventory.senzuBeans > 0 && props.health < 100 ? 'bg-green-600 border-green-400 shadow-lg cursor-pointer' : 'bg-gray-800 border-gray-600 opacity-50 cursor-not-allowed'}`}
          >
            <span className="text-2xl">💊</span>
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {props.inventory.senzuBeans}
            </span>
          </button>

          {/* زر الرادار */}
          <button
            onClick={props.onUseHint}
            disabled={props.inventory.hints === 0 || props.hiddenAnswers.length > 0}
            aria-label="استخدام تلميح"
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all border-2 active:scale-90 ${props.inventory.hints > 0 && props.hiddenAnswers.length === 0 ? 'bg-blue-600 border-blue-400 shadow-lg cursor-pointer' : 'bg-gray-800 border-gray-600 opacity-50 cursor-not-allowed'}`}
          >
            <span className="text-2xl">📡</span>
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {props.inventory.hints}
            </span>
          </button>

        </div>
      </div>
    </motion.div>
  );
}