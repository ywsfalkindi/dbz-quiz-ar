'use client'

interface QuestionCardProps {
  question: string
}

export default function QuestionCard({question}: QuestionCardProps) {
  return (
    <div className="w-full max-w-2xl p-8 my-8 bg-black bg-opacity-50 border-2 border-green-500 rounded-lg shadow-lg shadow-green-500/20">
      <h2 className="text-3xl font-bold text-center text-white" style={{fontFamily: "'Cairo', sans-serif"}}>
        {question}
      </h2>
    </div>
  )
}
