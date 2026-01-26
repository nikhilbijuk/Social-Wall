import React from 'react';
import { useApp } from '../context/AppContext';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Newspaper, CalendarDays, Compass } from 'lucide-react';

interface MobileNavItemProps {
    to: string;
    icon: React.ReactElement;
    label: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { currentEvent } = useApp();

    return (
        <div className="min-h-screen bg-background text-white flex overflow-hidden">
            <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none z-0" />

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-72 bg-surface border-r border-white/5 z-10 relative">
                <div className="p-8 relative">
                    <div className="absolute top-4 left-8 label-mono text-[8px]">Protocol: Hub_v1.0</div>
                    <h1 className="text-4xl font-black font-heading text-white tracking-tighter mix-blend-difference mt-4">
                        HACK<span className="text-primary">_</span>HUB
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
                        <p className="label-mono uppercase">{currentEvent?.name}</p>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-1">
                    <NavItem to="/dashboard/share" icon={<Newspaper size={18} />} label="Signal" />
                    <NavItem to="/dashboard/events" icon={<CalendarDays size={18} />} label="Timeline" />
                    <NavItem to="/dashboard/explore" icon={<Compass size={18} />} label="Discovery" />
                </nav>

                {/* Decorative Grid Marker */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/5 opacity-50" />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative z-0 overflow-hidden h-screen bg-background">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <header className="md:hidden flex items-center justify-between p-6 bg-surface border-b border-white/10 sticky top-0 z-20">
                    <h1 className="text-xl font-black font-heading text-white">HACK_HUB</h1>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-24 md:pb-12 relative z-10">
                    {children}
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 z-30 pb-safe">
                    <div className="flex justify-around items-center h-16 px-2">
                        <MobileNavItem to="/dashboard/events" icon={<CalendarDays size={20} />} label="Events" />
                        <MobileNavItem to="/dashboard/explore" icon={<Compass size={20} />} label="Explore" />
                        <div className="relative -top-4">
                            <NavLink to="/dashboard/share" className="flex items-center justify-center w-14 h-14 bg-primary text-black shadow-lg">
                                <Newspaper size={24} />
                            </NavLink>
                        </div>
                    </div>
                </nav>
            </main>
        </div>
    );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactElement; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-4 transition-all duration-300 group relative border-l-2",
                isActive ? "bg-white/5 border-primary text-white" : "border-transparent text-white/30 hover:text-white"
            )}
        >
            {icon}
            <span className="text-xs font-black uppercase tracking-[0.15em]">{label}</span>
        </NavLink>
    );
}

function MobileNavItem({ to, icon, label }: MobileNavItemProps) {
    return (
        <NavLink 
            to={to} 
            className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-12 transition-colors", 
                isActive ? "text-primary" : "text-white/20"
            )}
        >
            {icon}
            <span className="label-mono text-[7px] mt-1">{label}</span>
        </NavLink>
    );
}