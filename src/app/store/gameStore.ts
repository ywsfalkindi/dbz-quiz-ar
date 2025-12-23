import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Question } from '../actions/gameActions';

type GameStatus = 'start' | 'playing' | 'won' | 'lost';

interface GameState {
  score: number;
  health: number;
  streak: number;
  currentQuestionIndex: number;
  status: GameStatus;
  questions: Question[];
  answerQuestion: (isCorrect: boolean) => void;
  resetGame: () => void;
  startGame: () => void;
  nextQuestion: () => void;
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
      status: 'start',
      questions: [],

      setQuestions: (questions: Question[]) => set({ questions }),

      answerQuestion: (isCorrect: boolean) =>
        set((state) => {
          if (state.status !== 'playing') return {};

          if (isCorrect) {
            return {
              score: state.score + 10 * (state.streak + 1),
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
          status: 'start',
          questions: [],
        }),

      startGame: () => set({ status: 'playing', currentQuestionIndex: 0 }),

      nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),

      setGameWon: () => set({ status: 'won' }),
    }),
    {
      name: 'dbz-game-storage', // اسم المفتاح في LocalStorage
      storage: createJSONStorage(() => localStorage), // مكان الحفظ
    }
  )
);

export default useGameStore;