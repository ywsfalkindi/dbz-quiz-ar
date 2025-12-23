'use client';
import { loginAction } from '@/app/actions/adminActions';
import { useActionState } from 'react'; // React 19 hook

export default function LoginPage() {
  // إدارة حالة النموذج (نجاح/فشل)
  const [state, action, isPending] = useActionState(async (_prev: unknown, formData: FormData) => {
    return await loginAction(formData);
  }, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] bg-space-pattern">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-dbz-orange/30">
        <h1 className="text-3xl font-bold text-center text-dbz-yellow mb-6">بوابة الحكام 👑</h1>
        
        <form action={action} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 mb-2">كلمة المرور السرية</label>
            <input 
              type="password" 
              name="password" 
              className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white focus:border-dbz-orange outline-none transition-colors"
              placeholder="أدخل كلمة السر..."
              required 
            />
          </div>

          {state?.error && (
            <p className="text-red-500 text-sm text-center font-bold animate-pulse">{state.error}</p>
          )}

          <button 
            disabled={isPending}
            className="bg-linear-to-r from-dbz-orange to-red-600 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isPending ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}