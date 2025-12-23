'use server';
import { z } from 'zod'; 
import { headers } from 'next/headers';
import { client } from '@/../sanity/lib/client';

const rateLimitMap = new Map<string, number>();

// Interface for answers as they are stored in Sanity (including isCorrect)
interface SanityAnswer {
  _key: string;
  answer: string;
  isCorrect?: boolean;
}

// Interface for questions as they are stored in Sanity
interface SanityQuestion {
  _id: string;
  title: string;
  image?: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
  explanation: string;
  answers: SanityAnswer[];
}


// Interface for sanitized answers returned to the client
export interface Answer {
  _key: string;
  answer: string;
}

// Interface for sanitized questions returned to the client
export interface Question {
  _id: string;
  title: string;
  image?: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
  explanation: string;
  answers: Answer[];
}

/**
 * Fetches and sanitizes questions for the game from Sanity.
 * It removes the `isCorrect` field from the answers to prevent cheating.
 * @returns A promise that resolves to an array of sanitized questions.
 */
export const fetchGameQuestions = async (): Promise<Question[]> => {
  // Fetch full data structure but only return sanitized version
  const questions = await client.fetch<SanityQuestion[]>(`*[_type == "question"]{
    _id,
    title,
    image,
    explanation,
    answers[]{
      _key,
      answer
    }
  }`);
  
  return questions.map(q => ({
    ...q,
    answers: q.answers || [],
  }));
};

/**
 * Verifies an answer for a given question against the data in Sanity.
 * @param questionId The ID of the question being answered.
 * @param answerKey The _key of the selected answer.
 * @returns A promise that resolves to an object containing whether the answer was correct,
 * the key of the correct answer, and the explanation.
 */

const verifyAnswerSchema = z.object({
  questionId: z.string().min(1, "معرف السؤال مطلوب"),
  answerKey: z.string().min(1, "معرف الإجابة مطلوب"),
});

export const verifyAnswerAction = async (
  questionId: string,
  answerKey: string
): Promise<{ isCorrect: boolean; correctAnswerKey: string; explanation: string | null }> => {
  
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const lastRequestTime = rateLimitMap.get(ip) || 0;
  
  // السماح بطلب واحد كل 500 مللي ثانية (نصف ثانية)
  if (now - lastRequestTime < 500) {
     return { 
      isCorrect: false, 
      correctAnswerKey: '', 
      explanation: 'أنت سريع جداً! هدئ من روعك يا غوكو (انتظر قليلاً).' 
    };
  }
  
  rateLimitMap.set(ip, now);
  // --- بداية الكود الجديد (التحقق) ---
  const result = verifyAnswerSchema.safeParse({ questionId, answerKey });

  if (!result.success) {
    console.error("Validation Error:", result.error);
    return { 
      isCorrect: false, 
      correctAnswerKey: '', 
      explanation: 'بيانات غير صالحة! هل تحاول خداع زين-أوه؟' 
    };
  }
  try {
    // Fetch the question with the full answer data for verification
    const question = await client.fetch<SanityQuestion>(
      `*[_type == "question" && _id == $questionId][0]{
        explanation,
        answers
      }`,
      { questionId }
    );

    if (!question || !question.answers) {
      throw new Error('Question not found or has no answers.');
    }

    const selectedAnswer = question.answers.find(
      (ans: SanityAnswer) => ans._key === answerKey
    );

    const correctAnswer = question.answers.find(
        (ans: SanityAnswer) => ans.isCorrect === true
    );

    if (!selectedAnswer) {
      throw new Error('Answer not found.');
    }

    if (!correctAnswer) {
        throw new Error('Correct answer not defined for this question in Sanity.');
    }

    return {
      isCorrect: selectedAnswer.isCorrect === true,
      correctAnswerKey: correctAnswer._key,
      explanation: question.explanation || null,
    };
  } catch (error) {
    console.error('Error verifying answer:', error);
    // In case of error, return a fallback that prevents crashes
    return { isCorrect: false, correctAnswerKey: '', explanation: 'An error occurred during verification.' };
  }
};
