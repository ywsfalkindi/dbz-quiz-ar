'use client';

export default function GameSkeleton() {
  return (
    <div className="w-full max-w-3xl flex flex-col gap-6 animate-pulse px-4">
      {/* مكان الهيدر */}
      <div className="w-full flex justify-between items-end h-20">
         <div className="w-1/2 h-4 bg-white/10 rounded-full"></div>
         <div className="w-16 h-16 bg-white/10 rounded-lg"></div>
      </div>

      {/* مكان السؤال */}
      <div className="w-full h-40 bg-white/5 rounded-2xl border border-white/5"></div>

      {/* مكان الأجوبة */}
      <div className="space-y-3 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full h-16 bg-white/5 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
}