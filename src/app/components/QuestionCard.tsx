'use client'
import { motion } from 'framer-motion';
import Image from 'next/image';
import { urlFor } from '@/../sanity/lib/image';
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface QuestionCardProps {
  question: string;
  image?: SanityImageSource; // Sanity Image Source
  borderColor: string;
}

export default function QuestionCard({ question, image, borderColor }: QuestionCardProps) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-2xl p-6 my-4 glass-panel rounded-2xl relative overflow-hidden flex flex-col items-center gap-4"
      style={{ borderTop: `4px solid ${borderColor}` }}
    >
      {/* لمعان خفيف */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-white/20 to-transparent" />
      
      {/* عرض الصورة بتقنية Next.js Optimization */}
      {image && (
        <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden border border-white/10">
          <Image 
            src={urlFor(image).width(800).url()} 
            alt="صورة السؤال"
            fill
            className="object-cover"
            priority // تحميل سريع جداً لأنها أهم عنصر
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      )}
      
      <h2 className="text-xl md:text-2xl font-bold text-center text-white leading-relaxed font-cairo">
        {question}
      </h2>
    </motion.div>
  )
}