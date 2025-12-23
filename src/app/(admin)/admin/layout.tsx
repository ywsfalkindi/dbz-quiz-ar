import Link from 'next/link';
import { logoutAction } from '@/app/actions/adminActions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-cairo">
      <aside className="w-64 bg-black/90 border-l border-white/10 fixed h-full z-20 hidden md:flex flex-col">
        <div className="p-6 text-2xl font-black text-dbz-yellow text-center border-b border-white/5">
          لوحة حكام الدمار
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block p-3 rounded-lg hover:bg-white/5 transition-colors">
            📊 نظرة عامة
          </Link>
          <Link href="/admin/users" className="block p-3 rounded-lg hover:bg-white/5 transition-colors">
            👥 المقاتلين (اللاعبين)
          </Link>
          <Link href="/admin/questions" className="block p-3 rounded-lg hover:bg-white/5 transition-colors">
            ❓ بنك الأسئلة
          </Link>
          <Link href="/admin/settings" className="block p-3 rounded-lg hover:bg-white/5 transition-colors">
            ⚙️ قوانين الكون
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <form action={logoutAction}>
            <button className="w-full p-3 bg-red-600/20 text-red-500 border border-red-600/50 rounded-lg hover:bg-red-600 hover:text-white transition-all">
              خروج من البعد
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 md:mr-64 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}