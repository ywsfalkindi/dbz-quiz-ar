'use client'
import {motion} from 'framer-motion'
import {useState} from 'react'

interface AnswerButtonProps {
  answer: string
  onClick: () => void
  isCorrect: boolean | null // null when not answered yet
}

export default function AnswerButton({answer, onClick, isCorrect}: AnswerButtonProps) {
  const [answered, setAnswered] = useState(false)

  const handleClick = () => {
    setAnswered(true)
    onClick()
  }

  const buttonVariants = {
    rest: {
      scale: 1,
      boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
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
      scale: 1.1,
      transition: {duration: 0.5},
    },
    incorrect: {
      backgroundColor: '#ef4444', // red-500
      color: '#ffffff',
      x: [0, -10, 10, -10, 10, 0],
      transition: {duration: 0.5},
    },
  }

  const getAnimateState = () => {
    if (!answered) return 'rest'
    return isCorrect ? 'correct' : 'incorrect'
  }

  return (
    <motion.button
      variants={buttonVariants}
      initial="rest"
      animate={getAnimateState()}
      whileHover={answered ? '' : 'hover'}
      whileTap={answered ? '' : 'tap'}
      onClick={handleClick}
      disabled={answered}
      className="w-full p-4 my-2 text-xl font-bold text-green-400 bg-black bg-opacity-70 border-2 border-green-500 rounded-lg focus:outline-none"
    >
      {answer}
    </motion.button>
  )
}
