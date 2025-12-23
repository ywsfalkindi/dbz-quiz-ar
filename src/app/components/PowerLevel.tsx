'use client'
import {motion} from 'framer-motion'

interface PowerLevelProps {
  score: number
}

export default function PowerLevel({score}: PowerLevelProps) {
  return (
    <div className="flex flex-col items-center p-4 bg-black bg-opacity-50 border border-red-500 rounded-lg">
      <h3 className="text-lg font-bold text-red-500">مستوى الطاقة</h3>
      <motion.div
        className="text-5xl font-mono font-bold text-white"
        initial={{scale: 1}}
        animate={{scale: [1, 1.2, 1]}}
        key={score} // Re-triggers animation on score change
      >
        {score}
      </motion.div>
    </div>
  )
}
