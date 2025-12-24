// src/app/hooks/useGameLogic.ts
import { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { fetchGameQuestions, verifyAnswerAction, getWrongAnswersAction, getGameConfig } from '../actions/gameActions';
import useSound from '../../hooks/useSound';
import confetti from 'canvas-confetti';

// دالة اهتزاز الهاتف
const vibrateDevice = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const useGameLogic = () => {
  const store = useGameStore();
  const playSound = useSound(); // تفعيل نظام الصوت الجديد
  const [selectedAnswerKey, setSelectedAnswerKey] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [correctAnswerKey, setCorrectAnswerKey] = useState<string | null>(null);
  const [damageFlash, setDamageFlash] = useState(false);
  const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([]);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // 1. تحميل الإعدادات
  useEffect(() => {
    async function initGame() {
      const config = await getGameConfig();
      store.setGameConfig(config);
      setIsConfigLoaded(true);
    }
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. تحميل الأسئلة
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

  // تصفير الإجابات المخفية
  useEffect(() => {
    setHiddenAnswers([]);
  }, [store.currentQuestionIndex]);

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

  const triggerNextStep = () => {
    const { currentQuestionIndex, questions, health } = useGameStore.getState();
    if (currentQuestionIndex < questions.length - 1) {
      store.nextQuestion();
    } else {
      if (health > 0) {
        playSound('win');
        triggerWinConfetti();
        store.setGameWon();
      }
    }
    setSelectedAnswerKey(null);
    setIsVerifying(false);
    setCorrectAnswerKey(null);
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
    vibrateDevice([100, 50, 100, 50, 100]);
    setDamageFlash(true);
    setTimeout(() => setDamageFlash(false), 500);
    store.answerQuestion(false); 
    setTimeout(triggerNextStep, 1500);
  };

  const handleAnswer = async (questionId: string, answerKey: string) => {
    if (isVerifying || selectedAnswerKey) return;
    
    playSound('click');
    vibrateDevice(20);
    setIsVerifying(true);
    setSelectedAnswerKey(answerKey);

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
    setTimeout(triggerNextStep, 2000);
  };

  return {
    ...store,
    selectedAnswerKey, isVerifying, correctAnswerKey,
    damageFlash, hiddenAnswers, isConfigLoaded,
    handleStart, handleRestart, handleUseSenzu, handleUseHint, handleTimeUp, handleAnswer,
    saiyanForm: store.getSaiyanForm()
  };
};