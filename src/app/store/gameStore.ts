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
  difficultyMultiplier: number; // جديد: لزيادة الصعوبة
  inventory: { senzuBeans: number; hints: number };
  
  // Actions
  setQuestions: (questions: Question[]) => void;
  startGame: () => void;
  resetGame: () => void;
  answerQuestion: (isCorrect: boolean) => void;
  nextQuestion: () => void;
  decrementTimer: () => void;
  setGameWon: () => void;
  useSenzuBean: () => void;
  decrementHint: () => void;
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
      difficultyMultiplier: 0,
      inventory: { senzuBeans: 1, hints: 1 },

      setQuestions: (questions) => set({ questions }),

      startGame: () => set({ 
        status: 'playing', 
        currentQuestionIndex: 0, 
        timer: 15, 
        score: 0, 
        health: 100, 
        inventory: { senzuBeans: 1, hints: 1 } 
      }),

      resetGame: () => set({ status: 'start' }), // العودة للشاشة الرئيسية

      decrementTimer: () => set((state) => ({ timer: Math.max(0, state.timer - 1) })),

      useSenzuBean: () => set((state) => {
        if (state.inventory.senzuBeans > 0 && state.health < 100) {
          return {
            health: 100,
            inventory: { ...state.inventory, senzuBeans: state.inventory.senzuBeans - 1 }
          };
        }
        return {};
      }),

      decrementHint: () => set((state) => ({
        inventory: { ...state.inventory, hints: Math.max(0, state.inventory.hints - 1) }
      })),

      answerQuestion: (isCorrect) => set((state) => {
        if (state.status !== 'playing') return {};

        if (isCorrect) {
          const streakBonus = state.streak * 50;
          const timeBonus = state.timer * 10;
          return {
            score: state.score + 100 + streakBonus + timeBonus,
            streak: state.streak + 1,
            // كل 5 إجابات صحيحة متتالية تزيد الصعوبة قليلاً
            difficultyMultiplier: state.streak > 0 && state.streak % 5 === 0 ? state.difficultyMultiplier + 1 : state.difficultyMultiplier
          };
        }

        const newHealth = state.health - 25;
        return {
          health: newHealth,
          streak: 0,
          status: newHealth <= 0 ? 'lost' : state.status
        };
      }),

      nextQuestion: () => set((state) => {
        // حساب الوقت بناءً على الصعوبة: كلما زادت الصعوبة قل الوقت (بحد أدنى 5 ثواني)
        const newTime = Math.max(5, 15 - state.difficultyMultiplier);
        return {
          currentQuestionIndex: state.currentQuestionIndex + 1,
          timer: newTime
        };
      }),

      setGameWon: () => set({ status: 'won' }),

      getSaiyanForm: () => {
        const s = get().score;
        if (s >= 8000) return { form: 'ui', color: '#ffffff', label: 'الغريزة الفائقة' };
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