"use client";

import React from 'react';
import { AppProvider } from '@/context/AppContext';
import LeaderboardView from '@/components/Leaderboard';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
            <div className="flex h-screen bg-[#EFE7DD] overflow-hidden">
                {/* Sidebar / Leaderboard */}
                <aside className="hidden lg:block w-80 shrink-0 border-r border-black/5">
                    <LeaderboardView />
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Header */}
                    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center px-6 justify-between z-30">
                        <h2 className="text-sm font-black tracking-widest text-[#00A884]">EXPLORE_STREAM</h2>
                        <div className="flex gap-4 items-center">
                            <div className="w-2 h-2 rounded-full bg-[#00A884] animate-pulse" />
                            <span className="text-[10px] font-bold text-black/40 uppercase tracking-tighter">Live Connectivity</span>
                        </div>
                    </header>

                    <div className="flex-1">
                        {children}
                    </div>
                </main>
            </div>
        </AppProvider>
    );
}
