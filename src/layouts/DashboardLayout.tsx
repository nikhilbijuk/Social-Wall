import React from 'react';
import { NavLink } from 'react-router-dom';
import { Newspaper, CalendarDays, Compass } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-white flex overflow-hidden">
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-surface z-20">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-black font-heading tracking-tighter">HACK_HUB</h1>
        </div>
        <nav className="flex-1 p-6 space-y-1">
          <NavItem to="/dashboard/posts" icon={<Newspaper size={18} />} label="Posts" />
          <NavItem to="/dashboard/events" icon={<CalendarDays size={18} />} label="Events" />
          <NavItem to="/dashboard/explore" icon={<Compass size={18} />} label="Explore" />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative z-0 overflow-hidden h-screen bg-background">
        <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-24 md:pb-12 relative z-10">
          {children}
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 flex justify-around items-center h-16 px-2 z-50">
          <NavLink to="/dashboard/events" className={({ isActive }) => cn("flex flex-col items-center", isActive ? "text-primary" : "text-white/20")}>
            <CalendarDays size={20} />
            <span className="label-mono text-[7px] mt-1">Events</span>
          </NavLink>
          <NavLink to="/dashboard/posts" className={({ isActive }) => cn("flex flex-col items-center", isActive ? "text-primary" : "text-white/20")}>
            <Newspaper size={20} />
            <span className="label-mono text-[7px] mt-1">Posts</span>
          </NavLink>
          <NavLink to="/dashboard/explore" className={({ isActive }) => cn("flex flex-col items-center", isActive ? "text-primary" : "text-white/20")}>
            <Compass size={20} />
            <span className="label-mono text-[7px] mt-1">Explore</span>
          </NavLink>
        </nav>
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