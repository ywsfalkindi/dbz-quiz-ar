'use client'
import {motion} from 'framer-motion'

interface HealthBarProps {
  health: number
}

export default function HealthBar({health}: HealthBarProps) {
  const healthPercentage = Math.max(0, health)
  const barColor =
    healthPercentage > 50 ? 'bg-green-500' : healthPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-white">الطاقة</span>
        <span className="text-xl font-bold text-white">{healthPercentage}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4 border-2 border-gray-500 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{width: '100%'}}
          animate={{width: `${healthPercentage}%`}}
          transition={{duration: 0.5, ease: 'easeOut'}}
        />
      </div>
    </div>
  )
}
