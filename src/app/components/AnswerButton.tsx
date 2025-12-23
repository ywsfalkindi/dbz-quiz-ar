'use client'
import { motion } from 'framer-motion';

interface AnswerButtonProps {
  answer: string;
  onClick: () => void;
  isCorrect: boolean | null; // null: unanswered, true: correct, false: incorrect
  disabled?: boolean;
}

export default function AnswerButton({ answer, onClick, isCorrect, disabled }: AnswerButtonProps) {

  const buttonVariants = {
    rest: {
      scale: 1,
      boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#34d399', // green-400
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 20px rgba(0, 255, 0, 0.8)',
    },
    tap: {
      scale: 0.95,
    },
    correct: {
      backgroundColor: '#22c55e', // green-500
      color: '#ffffff',
      scale: 1.0,
      transition: { duration: 0.5 },
    },
    incorrect: {
      backgroundColor: '#ef4444', // red-500
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

  return (
    <motion.button
      variants={buttonVariants}
      initial="rest"
      animate={getAnimateState()}
      whileHover={disabled ? '' : 'hover'}
      whileTap={disabled ? '' : 'tap'}
      onClick={onClick}
      disabled={disabled}
      className="w-full p-4 my-2 text-xl font-bold border-2 border-green-500 rounded-lg focus:outline-none"
    >
      {answer}
    </motion.button>
  );
}
