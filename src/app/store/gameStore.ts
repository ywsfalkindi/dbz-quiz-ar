import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Question } from '../actions/gameActions';

type GameStatus = 'start' | 'playing' | 'won' | 'lost';

interface GameState {
  score: number;
  health: number;
  streak: number;
  currentQuestionIndex: number;
  timer: number; // الوقت المتبقي للسؤال الحالي
  status: GameStatus;
  questions: Question[];
  answerQuestion: (isCorrect: boolean) => void;
  resetGame: () => void;
  startGame: () => void;
  nextQuestion: () => void;
  decrementTimer: () => void; // دالة تنقيص الوقت
  setGameWon: () => void;
  setQuestions: (questions: Question[]) => void;
}

const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      score: 0,
      health: 100,
      streak: 0,
      currentQuestionIndex: 0,
      timer: 15, // القيمة الافتراضية للوقت (15 ثانية)
      status: 'start',
      questions: [],

      setQuestions: (questions: Question[]) => set({ questions }),

      // دالة تنقص الوقت بمقدار ثانية واحدة
      decrementTimer: () => set((state) => ({ 
        timer: Math.max(0, state.timer - 1) 
      })),

      answerQuestion: (isCorrect: boolean) =>
        set((state) => {
          if (state.status !== 'playing') return {};

          if (isCorrect) {
            // معادلة النقاط: الأساسية (10) + (الستريك * 5) + (الوقت المتبقي * 2)
            const timeBonus = state.timer * 2;
            const streakBonus = state.streak * 5;

            return {
              score: state.score + 10 + streakBonus + timeBonus,
              streak: state.streak + 1,
            };
          }

          const newHealth = state.health - 25;
          return {
            health: newHealth,
            streak: 0,
            status: newHealth <= 0 ? 'lost' : state.status,
          };
        }),

      resetGame: () =>
        set({
          score: 0,
          health: 100,
          streak: 0,
          currentQuestionIndex: 0,
          timer: 15,
          status: 'start',
          questions: [],
        }),

      startGame: () => set({ status: 'playing', currentQuestionIndex: 0, timer: 15 }),

      nextQuestion: () => set((state) => ({ 
        currentQuestionIndex: state.currentQuestionIndex + 1,
        timer: 15 // إعادة تعيين الوقت عند الانتقال للسؤال التالي
      })),

      setGameWon: () => set({ status: 'won' }),
    }),
    {
      name: 'dbz-game-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useGameStore;