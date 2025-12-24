import { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { fetchGameQuestions, verifyAnswerAction, getWrongAnswersAction, getGameConfig } from '../actions/gameActions';
// لاحظ: نستورد الهوك الجديد الذي أنشأناه للتو
import useSound from '../../hooks/useSound'; 
import confetti from 'canvas-confetti';

// وظيفة لاهتزاز الهاتف لإضافة شعور بالحماس (تعمل على الجوال فقط)
const vibrateDevice = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const useGameLogic = () => {
  const store = useGameStore();
  const playSound = useSound(); // تفعيل نظام الصوت

  // حالات محلية للتحكم في التفاعل اللحظي
  const [selectedAnswerKey, setSelectedAnswerKey] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [correctAnswerKey, setCorrectAnswerKey] = useState<string | null>(null);
  const [damageFlash, setDamageFlash] = useState(false); // ومضة حمراء عند الخطأ
  const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([]); // للإجابات المحذوفة (زر كايو)
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // 1. تحميل إعدادات اللعبة من السيرفر عند الفتح
  useEffect(() => {
    async function initGame() {
      const config = await getGameConfig();
      store.setGameConfig(config);
      setIsConfigLoaded(true);
    }
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. تحميل الأسئلة فقط عندما تبدأ اللعبة
  useEffect(() => {
    async function loadQuestions() {
      if (store.status === 'playing' && store.questions.length === 0) {
        const fetchedQuestions = await fetchGameQuestions();
        store.setQuestions(fetchedQuestions);
      }
    }
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status, store.questions.length]);

  // تصفير المساعدات (حذف إجابتين) عند كل سؤال جديد
  useEffect(() => {
    setHiddenAnswers([]);
  }, [store.currentQuestionIndex]);

  // --- دوال التحكم ---

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
    // شرط استخدام حبة السينزو: لديك مخزون + طاقتك ليست كاملة
    if (store.inventory.senzuBeans > 0 && store.health < 100) {
      playSound('correct');
      vibrateDevice([50, 50, 50]);
      store.useSenzuBean();
    }
  };

  const handleUseHint = async () => {
    const currentQuestion = store.questions[store.currentQuestionIndex];
    // شرط استخدام المساعدة: لديك رصيد + لم تستخدمها بعد + السؤال موجود
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

  // --- المنطق الحساس: الانتقال للسؤال التالي ---
  const triggerNextStep = () => {
    const { currentQuestionIndex, questions, health } = useGameStore.getState();
    
    // [تصحيح الخطأ القاتل]: نتحقق أولاً هل ما زال هناك أسئلة؟
    // إذا كان الترتيب الحالي أقل من (عدد الأسئلة - 1)، فهذا يعني بقي أسئلة.
    if (currentQuestionIndex < questions.length - 1) {
      store.nextQuestion(); // انتقل للسؤال التالي
    } else {
      // وصلنا للنهاية!
      if (health > 0) {
        // إذا كانت الصحة جيدة، إذن اللاعب فاز
        playSound('win');
        triggerWinConfetti();
        store.setGameWon(); // إنهاء اللعبة بالفوز
        // هام: لا نستدعي nextQuestion هنا، لكي لا يخرج الفهرس عن النطاق
      }
    }

    // تصفير الحالات للسؤال الجديد
    setSelectedAnswerKey(null);
    setIsVerifying(false);
    setCorrectAnswerKey(null);
  };

  // تأثير الاحتفال (قصاصات ورقية)
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

  const handleTimeUp = () => {
    if (isVerifying || selectedAnswerKey) return;
    playSound('wrong');
    vibrateDevice([100, 50, 100, 50, 100]);
    setDamageFlash(true); // تأثير الضرر
    setTimeout(() => setDamageFlash(false), 500);
    
    store.answerQuestion(false); // احتساب إجابة خاطئة
    
    // التحقق فوراً: هل مات اللاعب؟
    const { health } = useGameStore.getState();
    if (health > 0) {
        setTimeout(triggerNextStep, 1500); // انتقل للسؤال التالي بعد قليل
    }
    // إذا مات، المتجر (store) سيتكفل بتحويل الحالة إلى 'lost'
  };

  const handleAnswer = async (questionId: string, answerKey: string) => {
    if (isVerifying || selectedAnswerKey) return; // منع الضغط المزدوج
    
    playSound('click');
    vibrateDevice(20);
    setIsVerifying(true);
    setSelectedAnswerKey(answerKey);

    // التحقق من السيرفر (Server Action) لمنع الغش
    const { isCorrect, correctAnswerKey } = await verifyAnswerAction(questionId, answerKey);
    
    if (isCorrect) {
      playSound('correct');
      vibrateDevice([50, 30, 50]);
      confetti({
        particleCount: 100, spread: 70, origin: { y: 0.7 },
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

    // التحقق من حالة الخسارة قبل الانتقال
    const { health } = useGameStore.getState();
    if (health > 0 || isCorrect) {
         setTimeout(triggerNextStep, 2000);
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