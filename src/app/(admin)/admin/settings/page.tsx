'use client';
import { getGameConfig, updateGameConfig } from '@/app/actions/adminActions';
import { useEffect, useState, useActionState } from 'react';

interface GameConfigType {
  timerDuration: number;
  senzuCount: number;
  hintCount: number;
  isMaintenanceMode: boolean;
  thresholds?: { ssj: number; blue: number; ui: number };
  texts?: { winTitle: string; loseTitle: string; loadingText: string };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<GameConfigType | null>(null);

  useEffect(() => {
    getGameConfig().then(data => {
      setConfig(data);
      setLoading(false);
    });
  }, []);

  const [state, action, isPending] = useActionState(async (_prev: unknown, formData: FormData) => {
    return await updateGameConfig(formData);
  }, null);

  if (loading) return <div className="text-white">جاري الاتصال بـ ويس...</div>;
  if (!config) return null;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-8">تعديل قوانين الكون</h1>
      
      <form action={action} className="space-y-6">
        
        {/* القسم 1: الأساسيات */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-xl text-dbz-blue font-bold">⏱️ الزمن والأدوات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">وقت السؤال (ثواني)</label>
              <input type="number" name="timerDuration" defaultValue={config.timerDuration} className="w-full p-2 bg-black/50 border border-white/10 rounded text-white" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">عدد السينزو</label>
              <input type="number" name="senzuCount" defaultValue={config.senzuCount} className="w-full p-2 bg-black/50 border border-white/10 rounded text-white" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">عدد التلميحات</label>
              <input type="number" name="hintCount" defaultValue={config.hintCount} className="w-full p-2 bg-black/50 border border-white/10 rounded text-white" />
            </div>
          </div>
        </div>

        {/* القسم 2: مستويات الطاقة (Level 1 Requirement) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-dbz-yellow/20">
          <h2 className="text-xl text-dbz-yellow font-bold">⚡ متطلبات التحول (النقاط المطلوبة)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-yellow-400 text-sm mb-1">سوبر سايان</label>
              <input type="number" name="ssjThreshold" defaultValue={config.thresholds?.ssj || 2500} className="w-full p-2 bg-black/50 border border-yellow-500/30 rounded text-white" />
            </div>
            <div>
              <label className="block text-blue-400 text-sm mb-1">سوبر سايان بلو</label>
              <input type="number" name="blueThreshold" defaultValue={config.thresholds?.blue || 5000} className="w-full p-2 bg-black/50 border border-blue-500/30 rounded text-white" />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">الغريزة الفائقة</label>
              <input type="number" name="uiThreshold" defaultValue={config.thresholds?.ui || 8000} className="w-full p-2 bg-black/50 border border-white/30 rounded text-white" />
            </div>
          </div>
        </div>

        {/* القسم 3: النصوص (تعريب كامل) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-xl text-green-400 font-bold">📜 الرسائل والنصوص</h2>
          <div>
            <label className="block text-gray-400 text-sm mb-1">عنوان الفوز</label>
            <input type="text" name="winTitle" defaultValue={config.texts?.winTitle} className="w-full p-2 bg-black/50 border border-white/10 rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">عنوان الخسارة</label>
            <input type="text" name="loseTitle" defaultValue={config.texts?.loseTitle} className="w-full p-2 bg-black/50 border border-white/10 rounded text-white" />
          </div>
        </div>

        {/* وضع الصيانة */}
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
          <input type="checkbox" name="isMaintenanceMode" defaultChecked={config.isMaintenanceMode} className="w-5 h-5 accent-red-600" />
          <span className="text-red-400 font-bold">تجميد الكون (وضع الصيانة)</span>
        </div>

        <button disabled={isPending} className="w-full py-4 bg-dbz-orange text-white font-bold rounded-xl hover:brightness-110 shadow-lg">
          {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات الكونية'}
        </button>
        
        {state?.success && <p className="text-green-400 text-center font-bold">{state.success}</p>}
      </form>
    </div>
  );
}