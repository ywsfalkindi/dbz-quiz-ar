'use client';
import { getGameConfig, updateGameConfig } from '@/app/actions/adminActions';
import { useEffect, useState, useActionState } from 'react';

interface GameConfigType {
  timerDuration: number;
  senzuCount: number;
  hintCount: number;
  isMaintenanceMode: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<GameConfigType | null>(null);

  // تحميل الإعدادات عند فتح الصفحة
  useEffect(() => {
    getGameConfig().then(data => {
      setConfig(data);
      setLoading(false);
    });
  }, []);

  const [state, action, isPending] = useActionState(async (_prev: unknown, formData: FormData) => {
    return await updateGameConfig(formData);
  }, null);

  if (loading) return <div className="text-white">جاري الاتصال بـ كوكب كاي...</div>;
  if (!config) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-white mb-8">قوانين اللعبة (الإعدادات)</h1>
      
      <form action={action} className="glass-panel p-8 rounded-2xl space-y-6">
        
        {/* المؤقت */}
        <div>
          <label className="block text-dbz-blue font-bold mb-2">⏳ وقت السؤال (بالثواني)</label>
          <input 
            type="number" 
            name="timerDuration" 
            defaultValue={config.timerDuration}
            className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white"
          />
          <p className="text-xs text-gray-500 mt-1">القيمة الافتراضية: 15 ثانية</p>
        </div>

        {/* السينزو */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-green-500 font-bold mb-2">💊 حبوب السينزو</label>
            <input 
              type="number" 
              name="senzuCount" 
              defaultValue={config.senzuCount}
              className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-purple-400 font-bold mb-2">📡 عدد التلميحات</label>
            <input 
              type="number" 
              name="hintCount" 
              defaultValue={config.hintCount}
              className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white"
            />
          </div>
        </div>

        {/* وضع الصيانة */}
        <div className="flex items-center gap-4 p-4 border border-red-500/30 bg-red-500/5 rounded-lg">
          <input 
            type="checkbox" 
            name="isMaintenanceMode" 
            id="maint"
            defaultChecked={config.isMaintenanceMode}
            className="w-6 h-6 accent-red-600"
          />
          <label htmlFor="maint" className="text-red-400 font-bold cursor-pointer">
            تفعيل وضع الصيانة (إيقاف اللعبة) 🛑
          </label>
        </div>

        {state?.success && (
          <div className="p-3 bg-green-500/20 text-green-400 border border-green-500/50 rounded text-center">
            {state.success}
          </div>
        )}

        <button 
          disabled={isPending}
          className="w-full bg-dbz-orange text-white font-bold py-4 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_#F85B1A]"
        >
          {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>
    </div>
  );
}