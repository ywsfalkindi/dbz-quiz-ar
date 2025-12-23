'use client'
import { motion } from 'framer-motion';

interface QuestionCardProps {
  question: string;
  borderColor: string;
}

export default function QuestionCard({ question, borderColor }: QuestionCardProps) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-2xl p-8 my-6 glass-panel rounded-2xl relative overflow-hidden"
      style={{ borderTop: `4px solid ${borderColor}` }}
    >
      {/* تأثير لمعان خفيف */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-white/20 to-transparent" />
      
      <h2 className="text-2xl md:text-3xl font-bold text-center text-white leading-relaxed" style={{fontFamily: "'Cairo', sans-serif"}}>
        {question}
      </h2>
    </motion.div>
  )
}