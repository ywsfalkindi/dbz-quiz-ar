'use client';
import { motion } from 'framer-motion';
import { SaiyanForm } from '../store/gameStore';

export default function CharacterAvatar({ form }: { form: { form: SaiyanForm, color: string, label: string } }) {
  // يمكنك استبدال النصوص بصور حقيقية لكل تحول مستقبلاً
  const getEmoji = () => {
    switch(form.form) {
      case 'ui': return '⚪';
      case 'blue': return '🔵';
      case 'ssj': return '🟡';
      case 'kaioken': return '🔴';
      default: return '⚫';
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg glass-panel border-l-4" style={{ borderColor: form.color }}>
      <motion.div 
        key={form.form}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
        className="text-2xl"
      >
        {getEmoji()}
      </motion.div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 uppercase tracking-wider">الحالة الحالية</span>
        <span className="text-sm font-bold" style={{ color: form.color, textShadow: `0 0 10px ${form.color}` }}>
          {form.label}
        </span>
      </div>
    </div>
  );
}