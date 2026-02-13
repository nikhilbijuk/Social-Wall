import React from 'react';

import { MessageSquare } from 'lucide-react';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] bg-[#E5DDD5] flex flex-col overflow-hidden">
      {/* Header - Full Width with Safe Area Top */}
      <div
        className="bg-[#00A884] text-white p-4 flex items-center shadow-md z-20 shrink-0"
        style={{ paddingTop: 'calc(1rem + var(--sat, 0px))', paddingLeft: 'calc(1rem + var(--sal, 0px))', paddingRight: 'calc(1rem + var(--sar, 0px))' }}
      >
        <MessageSquare className="w-6 h-6 mr-3 text-[#EFE7DD] fill-[#EFE7DD]/20" />
        <h1 className="text-xl font-bold tracking-tight text-white flex-1">SOCIAL WALL</h1>
      </div>

      {/* Main Content Area - Full Width & Scrolable */}
      <main className="flex-1 relative overflow-hidden bg-[#EFE7DD]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
          style={{ backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <div className="h-full w-full overflow-y-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}

