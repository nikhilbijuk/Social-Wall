import React from 'react';
import { NavLink } from 'react-router-dom';
import { Newspaper, CalendarDays, Compass, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#E5DDD5] relative">
      {/* Decorative Background Strip (WhatsApp Style) */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-primary z-0"></div>

      <main className="relative z-10 container mx-auto p-0 md:p-4 h-[100dvh] flex flex-col">
        {/* Header */}
        <div className="bg-[#00A884] text-white p-4 flex items-center shadow-sm z-20 sticky top-0 md:rounded-t-xl shrink-0">
          <MessageSquare className="w-6 h-6 mr-3 text-[#EFE7DD] fill-[#EFE7DD]/20" />
          <h1 className="text-xl font-bold tracking-tight text-white flex-1">SOCIAL WALL</h1>
        </div>

        {/* Content Area */}
        <div className="bg-white/50 backdrop-blur-md flex-1 overflow-hidden rounded-b-xl shadow-lg border border-white/20 relative">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => cn("flex items-center gap-4 px-4 py-4 border-l-2 transition-all", isActive ? "bg-white/5 border-primary text-white" : "border-transparent text-white/30")}>
      {icon}
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </NavLink>
  );
}