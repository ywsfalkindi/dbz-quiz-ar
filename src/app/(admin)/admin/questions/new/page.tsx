'use client';
import { createQuestionAction } from '@/app/actions/adminActions';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewQuestionPage() {
  const router = useRouter();
  const [, action, isPending] = useActionState(async (_prev: unknown, formData: FormData) => {
    const res = await createQuestionAction(formData);
    if (res.success) router.push('/admin/questions');
    return res;
  }, null);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">إنشاء تحدي جديد</h1>
      
      <form action={action} className="glass-panel p-8 rounded-2xl space-y-6">
        <div>
          <label className="block text-dbz-blue font-bold mb-2">نص السؤال</label>
          <input name="title" required className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white" placeholder="مثال: من هو والد غوكو؟" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-green-500 font-bold mb-2">الإجابة الصحيحة ✅</label>
            <input name="correctAnswer" required className="w-full p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-white" />
          </div>
          <div>
             <label className="block text-red-500 font-bold mb-2">إجابة خاطئة 1 ❌</label>
             <input name="wrong1" required className="w-full p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-white" />
          </div>
          <div>
             <label className="block text-red-500 font-bold mb-2">إجابة خاطئة 2 ❌</label>
             <input name="wrong2" required className="w-full p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-white" />
          </div>
          <div>
             <label className="block text-red-500 font-bold mb-2">إجابة خاطئة 3 ❌</label>
             <input name="wrong3" required className="w-full p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-white" />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 font-bold mb-2">صورة السؤال (اختياري)</label>
          <input type="file" name="image" accept="image/*" className="w-full text-gray-400" />
        </div>

        <div>
          <label className="block text-gray-400 font-bold mb-2">شرح الإجابة (يظهر بعد الحل)</label>
          <textarea name="explanation" rows={3} className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white" placeholder="معلومة إضافية..."></textarea>
        </div>

        <button disabled={isPending} className="w-full py-4 bg-dbz-orange text-white font-bold rounded-xl hover:brightness-110 shadow-[0_0_15px_#F85B1A]">
          {isPending ? 'جاري الإرسال لكوكب كاي...' : 'نشر السؤال'}
        </button>
      </form>
    </div>
  );
}