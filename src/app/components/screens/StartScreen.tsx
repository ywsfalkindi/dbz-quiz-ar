'use client';
import { motion } from 'framer-motion';

export default function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      className="flex flex-col items-center justify-center h-full gap-8 z-10 p-4 text-center"
    >
      <h1 className="text-fluid-h1 font-black text-transparent bg-clip-text bg-linear-to-b from-dbz-yellow to-dbz-orange drop-shadow-[0_0_15px_rgba(248,91,26,0.5)]">
         دراغون كويز Z
      </h1>
      <p className="text-gray-400 text-fluid-p max-w-md px-4">
        أثبت أنك المحارب الأقوى في الكون. أجب بسرعة، تحول، وتصدر القائمة!
      </p>
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: '0 0 25px #F85B1A' }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="px-10 py-5 bg-linear-to-r from-red-600 to-dbz-orange text-white text-2xl font-bold rounded-full shadow-lg border border-red-400 cursor-pointer"
      >
        ابدأ القتال 🔥
      </motion.button>
    </motion.div>
  );
}