'use client';
import { getGameConfig, updateGameConfig } from '@/app/actions/adminActions';
import { useEffect, useState, useActionState } from 'react';

// تعريف الأنواع (نفس الموجودة في GameStore)
interface GameConfigType {
  timerDuration: number;
  senzuCount: number;
  hintCount: number;
  isMaintenanceMode: boolean;
  theme?: { primaryColor: string; secondaryColor: string; };
  sounds?: { clickSound?: string; correctSound?: string; wrongSound?: string; winSound?: string; };
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

  if (loading) return <div className="text-white text-center mt-10">جاري الاتصال بـ ويس...</div>;
  if (!config) return null;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-3xl font-bold text-white mb-8">🛠️ غرفة التحكم بالكون</h1>
      
      <form action={action} className="space-y-8">
        
        {/* 1. القوانين الأساسية */}
        <div className="glass-panel p-6 rounded-2xl border-t-4 border-blue-500">
          <h2 className="text-xl text-blue-400 font-bold mb-4">⏱️ القوانين الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label className="block text-gray-400 text-sm mb-1">وقت السؤال (ثواني)</label>
              <input type="number" name="timerDuration" defaultValue={config.timerDuration} className="input-field" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">عدد السينزو (محاولات)</label>
               <input type="number" name="senzuCount" defaultValue={config.senzuCount} className="input-field" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">عدد التلميحات</label>
              <input type="number" name="hintCount" defaultValue={config.hintCount} className="input-field" />
            </div>
          </div>
        </div>

        {/* 2. المظهر والألوان */}
        <div className="glass-panel p-6 rounded-2xl border-t-4 border-orange-500">
          <h2 className="text-xl text-orange-400 font-bold mb-4">🎨 ألوان الكون</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">اللون الأساسي (أزرار)</label>
              <div className="flex gap-2">
                <input type="color" name="primaryColor" defaultValue={config.theme?.primaryColor} className="h-10 w-20 cursor-pointer" />
                <input type="text" name="primaryColorText" defaultValue={config.theme?.primaryColor} className="input-field flex-1" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">اللون الثانوي (تأثيرات)</label>
              <div className="flex gap-2">
                <input type="color" name="secondaryColor" defaultValue={config.theme?.secondaryColor} className="h-10 w-20 cursor-pointer" />
                <input type="text" name="secondaryColorText" defaultValue={config.theme?.secondaryColor} className="input-field flex-1" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. الصوتيات */}
        <div className="glass-panel p-6 rounded-2xl border-t-4 border-purple-500">
          <h2 className="text-xl text-purple-400 font-bold mb-4">🔊 روابط الصوتيات (MP3)</h2>
          <div className="space-y-3">
             <div>
              <label className="block text-gray-400 text-sm mb-1">رابط صوت النقر</label>
              <input type="url" name="clickSound" defaultValue={config.sounds?.clickSound} placeholder="https://..." className="input-field" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">رابط الإجابة الصحيحة</label>
              <input type="url" name="correctSound" defaultValue={config.sounds?.correctSound} placeholder="https://..." className="input-field" />
            </div>
             <div>
              <label className="block text-gray-400 text-sm mb-1">رابط الفوز</label>
              <input type="url" name="winSound" defaultValue={config.sounds?.winSound} placeholder="https://..." className="input-field" />
            </div>
          </div>
        </div>

        {/* 4. حدود الطاقة */}
        <div className="glass-panel p-6 rounded-2xl border-t-4 border-yellow-500">
          <h2 className="text-xl text-yellow-400 font-bold mb-4">⚡ متطلبات التحول</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
               <label className="block text-yellow-400 text-sm mb-1">سوبر سايان</label>
              <input type="number" name="ssjThreshold" defaultValue={config.thresholds?.ssj} className="input-field" />
            </div>
            <div>
              <label className="block text-blue-400 text-sm mb-1">سوبر سايان بلو</label>
              <input type="number" name="blueThreshold" defaultValue={config.thresholds?.blue} className="input-field" />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">الغريزة الفائقة</label>
              <input type="number" name="uiThreshold" defaultValue={config.thresholds?.ui} className="input-field" />
            </div>
          </div>
        </div>

        {/* 5. وضع الصيانة */}
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
          <input type="checkbox" name="isMaintenanceMode" defaultChecked={config.isMaintenanceMode} className="w-5 h-5 accent-red-600 cursor-pointer" />
          <span className="text-red-400 font-bold">تفعيل وضع التدمير (الصيانة) - سيتم إغلاق اللعبة</span>
        </div>

        <button disabled={isPending} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95">
           {isPending ? 'جاري إعادة كتابة الواقع...' : 'حفظ التغييرات الكونية 💾'}
        </button>
        
        {state?.success && <p className="text-green-400 text-center font-bold text-lg animate-pulse">{state.success}</p>}
      </form>
    </div>
  );
}