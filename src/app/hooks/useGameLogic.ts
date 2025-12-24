import { useState, useEffect, useCallback } from 'react';
import useGameStore from '../store/gameStore';
import { fetchGameQuestions, verifyAnswerAction, getWrongAnswersAction, getGameConfig } from '../actions/gameActions';
import useSound from '../../hooks/useSound';
import confetti from 'canvas-confetti';

const vibrateDevice = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const useGameLogic = () => {
  const store = useGameStore();
  const playSound = useSound();
  
  const [selectedAnswerKey, setSelectedAnswerKey] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [correctAnswerKey, setCorrectAnswerKey] = useState<string | null>(null);
  const [damageFlash, setDamageFlash] = useState(false);
  const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([]);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // تحميل الإعدادات
  useEffect(() => {
    async function initGame() {
      try {
        const config = await getGameConfig();
        store.setGameConfig(config);
      } catch (e) {
        console.error("خطأ في التحميل", e);
      } finally {
        setIsConfigLoaded(true);
      }
    }
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // جلب الأسئلة
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

  // تنظيف الواجهة عند كل سؤال
  useEffect(() => {
    setHiddenAnswers([]);
    setSelectedAnswerKey(null);
    setIsVerifying(false);
    setCorrectAnswerKey(null);
  }, [store.currentQuestionIndex]);

  // الانتقال للتالي
  const triggerNextStep = useCallback(() => {
    const { currentQuestionIndex, questions, health } = useGameStore.getState();
    
    if (health <= 0) return;

    if (currentQuestionIndex < questions.length - 1) {
      store.nextQuestion();
    } else {
      playSound('win');
      triggerWinConfetti();
      store.setGameWon();
    }
  }, [store, playSound]);

  // الإجراءات
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
      playSound('correct');
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
    vibrateDevice([100, 50, 100]);
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 500);
    
    store.punishWrongAnswer();
    
    const { health } = useGameStore.getState();
    if (health > 0) {
        setTimeout(triggerNextStep, 1500);
    }
  };

  // --- التعامل مع الإجابة (النقطة الحرجة) ---
  const handleAnswer = async (questionId: string, answerKey: string) => {
    if (isVerifying || selectedAnswerKey) return;
    
    playSound('click');
    vibrateDevice(20);
    setIsVerifying(true);
    setSelectedAnswerKey(answerKey);

    // نجهز البيانات للسيرفر
    const currentState = useGameStore.getState();
    
    // نستدعي السيرفر
    const result = await verifyAnswerAction({
      questionId, 
      answerKey,
      currentScore: currentState.score,
      securityToken: currentState.securityToken,
      timeLeft: currentState.timer,
      streak: currentState.streak
    });

    if (result.isCorrect) {
      playSound('correct');
      vibrateDevice([50, 30, 50]);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#22c55e', '#FFD600'] });
      
      // تحديث النقاط من المصدر الموثوق (السيرفر)
      if (result.newScore !== undefined && result.newSecurityToken) {
          store.updateScoreSecurely(result.newScore, result.newSecurityToken, result.newStreak || 0);
      }

    } else {
      playSound('wrong');
      vibrateDevice([100, 100, 100]);
      setDamageFlash(true);
      setTimeout(() => setDamageFlash(false), 500);
      store.punishWrongAnswer();
    }

    setCorrectAnswerKey(result.correctAnswerKey || null);

    const delay = result.isCorrect ? 2000 : 2500;
    const { health } = useGameStore.getState();
    
    if (health > 0 || result.isCorrect) {
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