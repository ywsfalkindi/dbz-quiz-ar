import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Question } from '../actions/gameActions';

export type SaiyanForm = 'base' | 'kaioken' | 'ssj' | 'blue' | 'ui';

type GameStatus = 'start' | 'playing' | 'won' | 'lost';

interface GameState {
  score: number;
  health: number;
  streak: number;
  currentQuestionIndex: number;
  timer: number;
  status: GameStatus;
  questions: Question[];
  inventory: {
    senzuBeans: number;
    hints: number;
  };
  
  // Actions
  answerQuestion: (isCorrect: boolean) => void;
  resetGame: () => void;
  startGame: () => void;
  nextQuestion: () => void;
  decrementTimer: () => void;
  setGameWon: () => void;
  setQuestions: (questions: Question[]) => void;
  useSenzuBean: () => void;
  decrementHint: () => void;
  
  // Helpers
  getSaiyanForm: () => { form: SaiyanForm; color: string; label: string };
}

const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      score: 0,
      health: 100,
      streak: 0,
      currentQuestionIndex: 0,
      timer: 15,
      status: 'start',
      questions: [],
      inventory: {
        senzuBeans: 1,
        hints: 1,
      },

      setQuestions: (questions: Question[]) => set({ questions }),

      decrementTimer: () => set((state) => ({ 
        timer: Math.max(0, state.timer - 1) 
      })),

      useSenzuBean: () => set((state) => {
        if (state.inventory.senzuBeans > 0 && state.health < 100) {
          return {
            health: 100,
            inventory: { ...state.inventory, senzuBeans: state.inventory.senzuBeans - 1 }
          };
        }
        return {};
      }),

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
            const timeBonus = state.timer * 10;
            const streakBonus = state.streak * 50;
            return {
              score: state.score + 100 + streakBonus + timeBonus,
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
          inventory: { senzuBeans: 1, hints: 1 },
        }),

      startGame: () => set({ status: 'playing', currentQuestionIndex: 0, timer: 15 }),

      nextQuestion: () => set((state) => ({ 
        currentQuestionIndex: state.currentQuestionIndex + 1,
        timer: 15 
      })),

      setGameWon: () => set({ status: 'won' }),

      // منطق التحولات بناءً على النقاط
      getSaiyanForm: () => {
        const s = get().score;
        if (s >= 8000) return { form: 'ui', color: '#ffffff', label: 'الغريزة الفائقة' }; // الغريزة الفائقة
        if (s >= 5000) return { form: 'blue', color: '#00F0FF', label: 'سوبر سايان بلو' };
        if (s >= 2500) return { form: 'ssj', color: '#FFD600', label: 'سوبر سايان' };
        if (s >= 1000) return { form: 'kaioken', color: '#ef4444', label: 'كايوكين' };
        return { form: 'base', color: '#F85B1A', label: 'الحالة العادية' };
      }
    }),
    {
      name: 'dbz-game-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useGameStore;