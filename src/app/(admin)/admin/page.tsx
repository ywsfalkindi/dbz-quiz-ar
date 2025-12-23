import { getDashboardStats } from '@/app/actions/adminActions';

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">غرفة الزمن والروح (نظرة عامة)</h1>
      
      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-t-4 border-dbz-blue">
          <h3 className="text-gray-400 mb-2">عدد المحاربين (اللاعبين)</h3>
          <p className="text-4xl font-bold">{stats.playersCount}</p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl border-t-4 border-dbz-orange">
          <h3 className="text-gray-400 mb-2">مخزون الأسئلة</h3>
          <p className="text-4xl font-bold">{stats.questionsCount}</p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl border-t-4 border-dbz-yellow">
          <h3 className="text-gray-400 mb-2">أقوى محارب حتى الآن</h3>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-dbz-yellow">{stats.bestScore?.playerName || 'لا يوجد'}</span>
            <span className="text-sm font-mono text-gray-300">{stats.bestScore?.score || 0} نقطة</span>
          </div>
        </div>
      </div>
    </div>
  );
}