import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Question } from '../actions/gameActions';


export type SaiyanForm = 'base' | 'kaioken' | 'ssj' | 'blue' | 'ui';
type GameStatus = 'start' | 'playing' | 'won' | 'lost' | 'maintenance';

interface GameConfig {
  timerDuration: number;
  senzuCount: number;
  hintCount: number;
  theme?: { primaryColor: string; secondaryColor: string; backgroundImage?: string; };
  sounds?: { clickSound?: string; correctSound?: string; wrongSound?: string; winSound?: string; };
  thresholds: { ssj: number; blue: number; ui: number };
  texts: { loadingText: string; winTitle: string; loseTitle: string };
  isMaintenanceMode: boolean;
}

interface GameState {
  score: number;
  securityToken: string; // الختم الأمني
  health: number;
  streak: number;
  currentQuestionIndex: number;
  
  // نظام المؤقت الجديد
  timer: number;       // الوقت المتبقي للعرض
  endTime: number;     // اللحظة الزمنية الحقيقية التي ينتهي فيها السؤال

  status: GameStatus;
  questions: Question[];
  inventory: { senzuBeans: number; hints: number };
  config: GameConfig;

  setGameConfig: (config: GameConfig) => void;
  setQuestions: (questions: Question[]) => void;
  startGame: () => void;
  resetGame: () => void;
  
  // دوال التحديث
  updateScoreSecurely: (newScore: number, newToken: string, newStreak: number) => void;
  punishWrongAnswer: () => void;
  
  nextQuestion: () => void;
  syncTimer: () => void; // دالة جديدة لمزامنة الوقت
  
  setGameWon: () => void;
  useSenzuBean: () => void;
  decrementHint: () => void;
  getSaiyanForm: () => { form: SaiyanForm; color: string; label: string };
}

// الهاش المبدئي للصفر (يجب أن يتطابق مع منطق السيرفر إذا أردنا دقة متناهية، لكن هنا سنبدأ بفارغ ويتم تحديثه مع أول إجابة)
// للتبسيط في هذا الكود التعليمي، سنعتمد على أن السيرفر يقبل أول إجابة بناءً على السكور المرسل 0
const INITIAL_TOKEN = "init_token_hash"; 

const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      score: 0,
      securityToken: INITIAL_TOKEN,
      health: 100,
      streak: 0,
      currentQuestionIndex: 0,
      timer: 15,
      endTime: 0,
      status: 'start',
      questions: [],
      inventory: { senzuBeans: 1, hints: 1 },
      
      config: { 
        timerDuration: 15, senzuCount: 1, hintCount: 1, isMaintenanceMode: false,
        thresholds: { ssj: 2500, blue: 5000, ui: 8000 },
        texts: { loadingText: 'جاري تجميع الكي...', winTitle: 'انتصار ساحق!', loseTitle: 'تمت هزيمتك...' },
        theme: { primaryColor: '#F85B1A', secondaryColor: '#FFD600' }
      },

      setGameConfig: (config) => set(() => {
        if (config.isMaintenanceMode) return { config, status: 'maintenance' };
        return { config };
      }),

      setQuestions: (questions) => set({ questions }),

      startGame: () => {
        const state = get();
        // تحديد وقت النهاية: الوقت الحالي + مدة السؤال (بالمللي ثانية)
        const durationMs = state.config.timerDuration * 1000;
        set({ 
          status: 'playing', 
          currentQuestionIndex: 0, 
          timer: state.config.timerDuration, 
          endTime: Date.now() + durationMs, // ضبط ساعة النهاية
          score: 0, 
          securityToken: 'hash_of_zero', // يجب أن يطابق السيرفر، هنا سنفترض أن السيرفر يقبل البداية
          health: 100,
          streak: 0,
          inventory: { senzuBeans: state.config.senzuCount, hints: state.config.hintCount } 
        });
      },

      resetGame: () => set({ status: 'start' }),

      // دالة المزامنة: تحسب الفرق بين الآن ووقت النهاية
      syncTimer: () => set((state) => {
        if (state.status !== 'playing') return {};
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((state.endTime - now) / 1000));
        return { timer: remaining };
      }),

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

      // تحديث النقاط الآمن (يأتي من السيرفر)
      updateScoreSecurely: (newScore, newToken, newStreak) => set({
        score: newScore,
        securityToken: newToken,
        streak: newStreak
      }),

      // معاقبة الخطأ (يتم محلياً للإحساس بالسرعة، والسيرفر يتحقق لاحقاً)
      punishWrongAnswer: () => set((state) => {
        const newHealth = Math.max(0, state.health - 25);
        return {
          health: newHealth,
          streak: 0,
          status: newHealth <= 0 ? 'lost' : state.status 
        };
      }),

      nextQuestion: () => set((state) => {
        const baseTime = state.config.timerDuration;
        // كل 5 أسئلة نقلل الوقت ثانية لزيادة الحماس (بحد أدنى 5 ثواني)
        const difficultyReduction = Math.floor(state.currentQuestionIndex / 5); 
        const newDuration = Math.max(5, baseTime - difficultyReduction);
        
        return {
          currentQuestionIndex: state.currentQuestionIndex + 1,
          timer: newDuration,
          endTime: Date.now() + (newDuration * 1000) // إعادة ضبط ساعة النهاية
        };
      }),

      setGameWon: () => set({ status: 'won' }),

      getSaiyanForm: () => {
        const s = get().score;
        const t = get().config.thresholds;
        if (s >= t.ui) return { form: 'ui', color: '#ffffff', label: 'الغريزة الفائقة' };
        if (s >= t.blue) return { form: 'blue', color: '#00F0FF', label: 'سوبر سايان بلو' };
        if (s >= t.ssj) return { form: 'ssj', color: '#FFD600', label: 'سوبر سايان' };
        if (s >= 1000) return { form: 'kaioken', color: '#ef4444', label: 'كايوكين' };
        return { form: 'base', color: get().config.theme?.primaryColor || '#F85B1A', label: 'الحالة العادية' };
      }
    }),
    {
      name: 'dbz-game-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useGameStore;