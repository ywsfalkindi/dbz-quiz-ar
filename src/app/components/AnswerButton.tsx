'use client'
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface AnswerButtonProps {
  answer: string;
  onClick: () => void;
  isCorrect: boolean | null; 
  disabled?: boolean;
  isHidden?: boolean; 
}

export default function AnswerButton({ answer, onClick, isCorrect, disabled, isHidden }: AnswerButtonProps) {

  // ✅ 1. الـ Hook دائماً في القمة وبدون أي شروط تسبقه نهائياً
  useEffect(() => {
    // نضع المنطق بالداخل: لا تهتز إذا كان الزر مخفياً أو إذا كانت الإجابة لم تُحدد بعد
    if (!isHidden && isCorrect === false && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(200);
    }
  }, [isCorrect, isHidden]);

  // ✅ 2. تعريف المتغيرات (يجب أن تسبق الـ return)
  const buttonVariants = {
    rest: {
      scale: 1,
      boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#34d399', 
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 20px rgba(0, 255, 0, 0.8)',
    },
    tap: {
      scale: 0.95,
    },
    correct: {
      backgroundColor: '#22c55e', 
      color: '#ffffff',
      scale: 1.0,
      transition: { duration: 0.5 },
    },
    incorrect: {
      backgroundColor: '#ef4444', 
      color: '#ffffff',
      x: [0, -10, 10, -10, 10, 0], 
      transition: { duration: 0.5 },
    },
    disabled: {
        opacity: 0.6,
    }
  };

  const getAnimateState = () => {
    if (isCorrect === true) return 'correct';
    if (isCorrect === false) return 'incorrect';
    if (disabled) return 'disabled';
    return 'rest';
  };

  // ✅ 3. الـ return الوحيد في نهاية الدالة
  // نستخدم كلاس 'invisible' و 'pointer-events-none' لإخفاء الزر ومنع الضغط عليه
  return (
    <motion.button
      variants={buttonVariants}
      initial="rest"
      animate={getAnimateState()}
      whileHover={(disabled || isHidden) ? "" : "hover"}
      whileTap={(disabled || isHidden) ? "" : "tap"}
      onClick={onClick}
      disabled={disabled || isHidden}
      className={`w-full p-4 my-2 text-xl font-bold border-2 border-green-500 rounded-lg focus:outline-none transition-all ${
        isHidden ? 'invisible pointer-events-none' : 'visible'
      }`}
    >
      {answer}
    </motion.button>
  );
}