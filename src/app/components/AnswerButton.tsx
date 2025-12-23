'use client'
import { motion } from 'framer-motion';

interface AnswerButtonProps {
  answer: string;
  onClick: () => void;
  isCorrect: boolean | null; 
  disabled?: boolean;
  isHidden?: boolean;
}

export default function AnswerButton({ answer, onClick, isCorrect, disabled, isHidden }: AnswerButtonProps) {
  
  const getBackgroundColor = () => {
    if (isCorrect === true) return 'rgba(34, 197, 94, 0.9)'; // Green
    if (isCorrect === false) return 'rgba(239, 68, 68, 0.9)'; // Red
    return 'rgba(255, 255, 255, 0.05)'; // Default Glass
  };

  const getBorderColor = () => {
    if (isCorrect === true) return '#22c55e';
    if (isCorrect === false) return '#ef4444';
    return 'rgba(255, 255, 255, 0.2)';
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isHidden ? 0 : 1, x: 0 }}
      whileHover={!disabled && !isHidden ? { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' } : {}}
      whileTap={!disabled && !isHidden ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || isHidden}
      className={`w-full p-5 my-2 text-lg md:text-xl font-bold rounded-xl text-white backdrop-blur-sm transition-colors relative overflow-hidden group
      ${isHidden ? 'pointer-events-none' : 'cursor-pointer'}`}
      style={{
        backgroundColor: getBackgroundColor(),
        border: `1px solid ${getBorderColor()}`,
        boxShadow: isCorrect === true ? '0 0 20px rgba(34, 197, 94, 0.4)' : 'none'
      }}
    >
        {/* زخرفة تقنية بسيطة */}
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-hover:bg-dbz-energy transition-colors" />
        {answer}
    </motion.button>
  );
}