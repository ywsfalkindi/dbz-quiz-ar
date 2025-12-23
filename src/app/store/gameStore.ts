import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Question } from '../actions/gameActions';

type GameStatus = 'start' | 'playing' | 'won' | 'lost';

interface GameState {
  score: number;
  health: number;
  streak: number;
  currentQuestionIndex: number;
  timer: number;
  status: GameStatus;
  questions: Question[];
  // --- إضافة جديدة: المخزون ---
  inventory: {
    senzuBeans: number;
    hints: number;
  };
  // ---------------------------
  answerQuestion: (isCorrect: boolean) => void;
  resetGame: () => void;
  startGame: () => void;
  nextQuestion: () => void;
  decrementTimer: () => void;
  setGameWon: () => void;
  setQuestions: (questions: Question[]) => void;
  // --- إضافة جديدة: دوال القوى ---
  useSenzuBean: () => void;
  decrementHint: () => void;
  // -----------------------------
}

const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      score: 0,
      health: 100,
      streak: 0,
      currentQuestionIndex: 0,
      timer: 15,
      status: 'start',
      questions: [],
      // --- المخزون الابتدائي ---
      inventory: {
        senzuBeans: 1, // حبة واحدة
        hints: 1,      // تلميح واحد
      },

      setQuestions: (questions: Question[]) => set({ questions }),

      decrementTimer: () => set((state) => ({ 
        timer: Math.max(0, state.timer - 1) 
      })),

      // دالة استخدام حبة السينزو
      useSenzuBean: () => set((state) => {
        if (state.inventory.senzuBeans > 0 && state.health < 100) {
          return {
            health: 100,
            inventory: { ...state.inventory, senzuBeans: state.inventory.senzuBeans - 1 }
          };
        }
        return {};
      }),

      // دالة خصم التلميح
      decrementHint: () => set((state) => {
         if (state.inventory.hints > 0) {
          return {
            inventory: { ...state.inventory, hints: state.inventory.hints - 1 }
          };
         }
         return {};
      }),

      answerQuestion: (isCorrect: boolean) =>
        set((state) => {
          if (state.status !== 'playing') return {};

          if (isCorrect) {
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
          // --- إعادة المخزون ---
          inventory: { senzuBeans: 1, hints: 1 },
        }),

      startGame: () => set({ status: 'playing', currentQuestionIndex: 0, timer: 15 }),

      nextQuestion: () => set((state) => ({ 
        currentQuestionIndex: state.currentQuestionIndex + 1,
        timer: 15 
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