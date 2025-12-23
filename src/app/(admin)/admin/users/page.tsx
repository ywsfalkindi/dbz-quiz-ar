import { getAllPlayers, deletePlayerAction } from '@/app/actions/adminActions';

interface Player {
  _id: string;
  playerName: string;
  score: number;
  date: string;
}

export default async function UsersPage() {
  const players = await getAllPlayers();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">سجل المحاربين</h1>
      
      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">النقاط</th>
              <th className="p-4">التاريخ</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {players.map((player: Player) => (
              <tr key={player._id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-white">{player.playerName}</td>
                <td className="p-4 font-mono text-dbz-yellow">{player.score}</td>
                <td className="p-4 text-sm text-gray-400">
                  {new Date(player.date).toLocaleDateString('ar-EG')}
                </td>
                <td className="p-4">
                  <form action={async () => {
                    'use server';
                    await deletePlayerAction(player._id);
                  }}>
                    <button className="text-red-500 hover:text-red-400 hover:underline text-sm font-bold">
                      حذف (هاكاي) 🗑️
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {players.length === 0 && (
          <div className="p-8 text-center text-gray-500">لا يوجد محاربين بعد... الكون فارغ.</div>
        )}
      </div>
    </div>
  );
}