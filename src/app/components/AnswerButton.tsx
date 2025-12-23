'use client'
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface AnswerButtonProps {
  answer: string;
  onClick: () => void;
  isCorrect: boolean | null; 
  disabled?: boolean;
  isHidden?: boolean;
}

export default function AnswerButton({ answer, onClick, isCorrect, disabled, isHidden }: AnswerButtonProps) {
  
  // دمج الكلاسات بشكل ذكي
  const classes = twMerge(
    // الشكل الأساسي
    "w-full p-5 my-2 text-lg md:text-xl font-bold rounded-xl text-white backdrop-blur-sm transition-all relative overflow-hidden group border",
    // حالة الإخفاء (زر كايو)
    isHidden ? "opacity-0 pointer-events-none absolute" : "opacity-100",
    // المؤشر
    disabled || isHidden ? "cursor-default" : "cursor-pointer active:scale-95",
    // الألوان حسب الحالة
    isCorrect === true 
      ? "bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
      : isCorrect === false
      ? "bg-red-500/20 border-red-500"
      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
  );

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isHidden ? 0 : 1, x: 0 }}
      onClick={onClick}
      disabled={disabled || isHidden}
      className={classes}
    >
        {/* تأثير جانبي جمالي */}
        <span className={`absolute right-0 top-0 bottom-0 w-1 transition-colors ${
          isCorrect === true ? 'bg-green-500' :
          isCorrect === false ? 'bg-red-500' :
          'bg-white/10 group-hover:bg-dbz-energy'
        }`} />
      
      {answer}
    </motion.button>
  );
}