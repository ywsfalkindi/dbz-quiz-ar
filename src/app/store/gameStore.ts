import { create } from 'zustand';
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

const useGameStore = create<GameState>((set) => ({
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
          score: state.score + 10 * (state.streak + 1), // Increase score more with streak
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
    
    // Helper function to start the game
    startGame: () => set({ status: 'playing', currentQuestionIndex: 0 }),

    // Helper to advance to the next question
    nextQuestion: () => set(state => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),

    // Helper to set game won status
    setGameWon: () => set({ status: 'won' }),
}));

export default useGameStore;
