import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Question } from '../actions/gameActions';

export type SaiyanForm = 'base' | 'kaioken' | 'ssj' | 'blue' | 'ui';
type GameStatus = 'start' | 'playing' | 'won' | 'lost' | 'maintenance';

interface GameConfig {
  timerDuration: number;
  senzuCount: number;
  hintCount: number;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    backgroundImage?: string;
  };
  sounds?: {
    clickSound?: string;
    correctSound?: string;
    wrongSound?: string;
    winSound?: string;
  };
  thresholds: { ssj: number; blue: number; ui: number };
  texts: { loadingText: string; winTitle: string; loseTitle: string };
  isMaintenanceMode: boolean;
}

interface GameState {
  score: number;
  health: number;
  streak: number;
  currentQuestionIndex: number;
  timer: number;
  status: GameStatus;
  questions: Question[];
  difficultyMultiplier: number;
  inventory: { senzuBeans: number; hints: number };
  config: GameConfig;
  setGameConfig: (config: GameConfig) => void;
  setQuestions: (questions: Question[]) => void;
  startGame: () => void;
  resetGame: () => void;
  answerQuestion: (isCorrect: boolean) => void;
  nextQuestion: () => void;
  decrementTimer: () => void;
  setGameWon: () => void;
  setGameLost: () => void; // دالة جديدة لضبط الخسارة صراحة
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
      
      // الإعدادات الافتراضية المعربة بالكامل
      config: { 
        timerDuration: 15, senzuCount: 1, hintCount: 1, isMaintenanceMode: false,
        thresholds: { ssj: 2500, blue: 5000, ui: 8000 },
        texts: { 
            loadingText: 'جاري استجماع طاقة الكي...', 
            winTitle: 'انتصار أسطوري!', 
            loseTitle: 'تمت هزيمتك...' 
        },
        theme: { primaryColor: '#F85B1A', secondaryColor: '#FFD600' }
      },

      setGameConfig: (config) => set(() => {
        if (config.isMaintenanceMode) return { config, status: 'maintenance' };
        return { config };
      }),

      setQuestions: (questions) => set({ questions }),

      startGame: () => {
        const state = get();
        set({ 
          status: 'playing', 
          currentQuestionIndex: 0, 
          timer: state.config.timerDuration, 
          score: 0, 
          health: 100,
          streak: 0, // تصفير التتابع
          inventory: { 
            senzuBeans: state.config.senzuCount, 
            hints: state.config.hintCount 
          } 
        });
      },

      resetGame: () => set({ status: 'start' }),

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
          // زيادة مضاعف الصعوبة كل 5 إجابات صحيحة متتالية
          const newMultiplier = (state.streak + 1) % 5 === 0 ? state.difficultyMultiplier + 1 : state.difficultyMultiplier;
          
          return {
            score: state.score + 100 + streakBonus + timeBonus,
            streak: state.streak + 1,
            difficultyMultiplier: newMultiplier
          };
        } else {
          const newHealth = Math.max(0, state.health - 25); // خصم 25% من الصحة
          return {
            health: newHealth,
            streak: 0,
            // إذا وصلت الصحة لصفر، تنتهي اللعبة فوراً
            status: newHealth <= 0 ? 'lost' : state.status 
          };
        }
      }),

      nextQuestion: () => set((state) => {
        const baseTime = state.config.timerDuration;
        // تقليل الوقت كلما زادت الصعوبة (بحد أدنى 5 ثواني)
        const newTime = Math.max(5, baseTime - state.difficultyMultiplier);
        return {
          currentQuestionIndex: state.currentQuestionIndex + 1,
          timer: newTime
        };
      }),

      setGameWon: () => set({ status: 'won' }),
      setGameLost: () => set({ status: 'lost' }),

      getSaiyanForm: () => {
        const s = get().score;
        const config = get().config;
        const t = config?.thresholds || { ssj: 2500, blue: 5000, ui: 8000 };
        
        // التحولات ومسمياتها العربية
        if (s >= t.ui) return { form: 'ui', color: '#ffffff', label: 'الغريزة الفائقة' };
        if (s >= t.blue) return { form: 'blue', color: '#00F0FF', label: 'سوبر سايان بلو' };
        if (s >= t.ssj) return { form: 'ssj', color: '#FFD600', label: 'سوبر سايان' };
        if (s >= 1000) return { form: 'kaioken', color: '#ef4444', label: 'كايوكين' };
        
        return { form: 'base', color: config.theme?.primaryColor || '#F85B1A', label: 'الحالة العادية' };
      }
    }),
    {
      name: 'dbz-game-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useGameStore;