import { useState, useEffect, useCallback } from 'react';
import useGameStore from '../store/gameStore';
import { fetchGameQuestions, verifyAnswerAction, getWrongAnswersAction, getGameConfig } from '../actions/gameActions';
import useSound from '../../hooks/useSound';
import confetti from 'canvas-confetti';

// دالة الاهتزاز (للهواتف فقط)
const vibrateDevice = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const useGameLogic = () => {
  const store = useGameStore();
  const playSound = useSound();

  // حالات محلية خاصة بواجهة المستخدم فقط
  const [selectedAnswerKey, setSelectedAnswerKey] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [correctAnswerKey, setCorrectAnswerKey] = useState<string | null>(null);
  const [damageFlash, setDamageFlash] = useState(false);
  const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([]);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // 1. تحميل الإعدادات عند فتح الموقع
  useEffect(() => {
    async function initGame() {
      try {
        const config = await getGameConfig();
        store.setGameConfig(config);
      } catch (e) {
        console.error("فشل تحميل الإعدادات، استخدام الافتراضي", e);
      } finally {
        setIsConfigLoaded(true);
      }
    }
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. جلب الأسئلة عند بدء اللعب
  useEffect(() => {
    async function loadQuestions() {
      if (store.status === 'playing' && store.questions.length === 0) {
        const fetchedQuestions = await fetchGameQuestions();
        store.setQuestions(fetchedQuestions);
      }
    }
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status]);

  // تصفير التأثيرات عند كل سؤال جديد
  useEffect(() => {
    setHiddenAnswers([]);
    setSelectedAnswerKey(null);
    setIsVerifying(false);
    setCorrectAnswerKey(null);
  }, [store.currentQuestionIndex]);

  // --- منطق الانتقال للسؤال التالي أو إنهاء اللعبة ---
  const triggerNextStep = useCallback(() => {
    const { currentQuestionIndex, questions, health } = useGameStore.getState();
    
    // إذا مات اللاعب، لا تفعل شيئاً (المتجر تكفل بتحويل الحالة لخسارة)
    if (health <= 0) return;

    // هل تبقى أسئلة؟
    if (currentQuestionIndex < questions.length - 1) {
      store.nextQuestion();
    } else {
      // انتهت الأسئلة واللاعب ما زال حياً = فوز
      playSound('win');
      triggerWinConfetti();
      store.setGameWon();
    }
  }, [store, playSound]);

  // --- الإجراءات ---

  const handleStart = () => {
    if (!isConfigLoaded) return;
    playSound('click');
    vibrateDevice(50);
    store.startGame();
  };

  const handleRestart = () => {
    playSound('click');
    vibrateDevice(50);
    store.resetGame();
  };

  const handleUseSenzu = () => {
    if (store.inventory.senzuBeans > 0 && store.health < 100) {
      playSound('correct'); // صوت إيجابي
      vibrateDevice([50, 50, 50]);
      store.useSenzuBean();
    }
  };

  const handleUseHint = async () => {
    const currentQuestion = store.questions[store.currentQuestionIndex];
    if (store.inventory.hints > 0 && hiddenAnswers.length === 0 && currentQuestion && !isVerifying) {
      const wrongKeys = await getWrongAnswersAction(currentQuestion._id);
      if (wrongKeys.length > 0) {
        playSound('click'); 
        vibrateDevice(50);
        setHiddenAnswers(wrongKeys);
        store.decrementHint();
      }
    }
  };

  // تأثير الاحتفال
  const triggerWinConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 5, angle: 60, spread: 55, origin: { x: 0 },
        colors: ['#F85B1A', '#FFD600', '#00F0FF']
      });
      confetti({
        particleCount: 5, angle: 120, spread: 55, origin: { x: 1 },
        colors: ['#F85B1A', '#FFD600', '#00F0FF']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  // عند انتهاء الوقت
  const handleTimeUp = () => {
    // إذا كان اللاعب قد أجاب بالفعل ويتم التحقق، لا تحتسب الوقت
    if (isVerifying || selectedAnswerKey) return;

    playSound('wrong');
    vibrateDevice([100, 50, 100]);
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 500);
    
    store.answerQuestion(false); // إجابة خاطئة
    
    // التحقق هل مات؟
    const { health } = useGameStore.getState();
    if (health > 0) {
        // ننتظر قليلاً ليرى اللاعب أنه أخطأ ثم ننتقل
        setTimeout(triggerNextStep, 1500);
    }
  };

  // عند اختيار إجابة
  const handleAnswer = async (questionId: string, answerKey: string) => {
    if (isVerifying || selectedAnswerKey) return; // منع النقر المتعدد
    
    playSound('click');
    vibrateDevice(20);
    
    setIsVerifying(true);
    setSelectedAnswerKey(answerKey);

    // التحقق من السيرفر
    const { isCorrect, correctAnswerKey } = await verifyAnswerAction(questionId, answerKey);

    if (isCorrect) {
      playSound('correct');
      vibrateDevice([50, 30, 50]);
      confetti({
        particleCount: 50, spread: 60, origin: { y: 0.8 },
        colors: ['#22c55e', '#FFD600']
      });
    } else {
      playSound('wrong');
      vibrateDevice([100, 100, 100]);
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 500);
    }

    store.answerQuestion(isCorrect);
    setCorrectAnswerKey(correctAnswerKey);

    // الانتقال للسؤال التالي بعد رؤية النتيجة
    // ننتظر أطول قليلاً إذا كانت الإجابة صحيحة للاحتفال، وأقل إذا كانت خاطئة
    const delay = isCorrect ? 2000 : 2500;
    
    // ملاحظة: حتى لو أصبحت الصحة 0، نعرض النتيجة أولاً ثم المتجر سيحدث الحالة لـ Lost
    // لكننا نتحقق هنا لكي لا ننتقل للسؤال التالي إذا خسر
    const { health } = useGameStore.getState();
    
    if (health > 0 || isCorrect) {
         setTimeout(triggerNextStep, delay);
    }
  };

  return {
    ...store,
    selectedAnswerKey, isVerifying, correctAnswerKey,
    damageFlash, hiddenAnswers, isConfigLoaded,
    handleStart, handleRestart, handleUseSenzu, handleUseHint, handleTimeUp, handleAnswer,
    saiyanForm: store.getSaiyanForm()
  };
};