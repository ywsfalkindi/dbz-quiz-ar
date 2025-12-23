import Link from 'next/link';
import { getAllQuestions, deleteQuestionAction } from '@/app/actions/adminActions';

interface QuestionItem {
  _id: string;
  title: string;
}

export default async function QuestionsPage() {
  const questions = await getAllQuestions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">بنك الأسئلة ({questions.length})</h1>
        <Link href="/admin/questions/new" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-transform hover:scale-105">
          + إضافة سؤال جديد
        </Link>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4">السؤال</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {questions.map((q: QuestionItem) => (
              <tr key={q._id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-medium">{q.title}</td>
                <td className="p-4">
                  <form action={async () => {
                    'use server';
                    await deleteQuestionAction(q._id);
                  }}>
                    <button className="text-red-500 hover:text-red-400 bg-red-500/10 px-3 py-1 rounded text-sm">
                      حذف
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr><td colSpan={2} className="p-8 text-center text-gray-500">لا توجد أسئلة.. أضف واحداً!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}