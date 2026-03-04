"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from "@/lib/utils";
import VerificationModal from '@/components/ui/VerificationModal';

export function Header() {
    const { level, userProfile, setShowVerificationModal, generateSyncCode } = useApp();
    const [syncCode, setSyncCode] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncRequest = async () => {
        setIsSyncing(true);
        const code = await generateSyncCode();
        setSyncCode(code);
        setIsSyncing(false);

        // Automatically hide after 1 minute or show until closed
        setTimeout(() => setSyncCode(null), 60000);
    };

    const getLevelInfo = (lv: number) => {
        switch (lv) {
            case 1: return { label: 'Verified Posting', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: '🟡' };
            case 2: return { label: 'Admin Broadcast', color: 'bg-orange-500/10 text-orange-600 border-orange-200', icon: '🟠' };
            case 3: return { label: 'Lockdown Mode', color: 'bg-red-500/10 text-red-600 border-red-200', icon: '🔴' };
            default: return { label: 'Open Mode', color: 'bg-green-500/10 text-green-600 border-green-200', icon: '🟢' };
        }
    };

    const info = getLevelInfo(level);

    return (
        <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-[#00A884] rounded-lg rotate-3 group-hover:rotate-0 transition-transform duration-200 shadow-lg shadow-[#00A884]/20 flex items-center justify-center text-white font-black italic">W</div>
                    <span className="font-black text-lg tracking-tighter uppercase grayscale group-hover:grayscale-0 transition-all duration-300">Social_Wall</span>
                </Link>
                <div className={cn("hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest", info.color)}>
                    <span>{info.icon}</span>
                    <span>Mode: {info.label}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {syncCode && (
                    <div className="flex flex-col items-center bg-black text-white px-3 py-1 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <span className="text-[8px] uppercase font-black tracking-widest leading-none mb-0.5">Sync Code</span>
                        <span className="text-sm font-black tracking-[0.2em]">{syncCode}</span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {userProfile?.name && (
                        <button
                            onClick={handleSyncRequest}
                            disabled={isSyncing}
                            className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-[#00A884]/10 hover:text-[#00A884] transition-all disabled:opacity-50"
                            title="Sync Device"
                        >
                            <RefreshCw size={18} className={cn(isSyncing && "animate-spin")} />
                        </button>
                    )}

                    {!userProfile?.is_verified && userProfile?.name && (
                        <button
                            onClick={() => setShowVerificationModal(true)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                            title="Get Verified"
                        >
                            <ShieldCheck size={18} />
                        </button>
                    )}
                </div>

                <nav className="flex items-center gap-3">
                    <Link href="/leaderboard" className="hidden sm:block text-xs font-black uppercase tracking-widest text-black/40 hover:text-[#00A884] transition-colors">Leaderboard</Link>
                    {userProfile?.is_admin && (
                        <Link href="/admin" className="text-xs font-black uppercase tracking-widest text-red-500 hover:scale-105 transition-all bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">Admin</Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export function VerificationModalWrapper() {
    const { showVerificationModal } = useApp();
    if (!showVerificationModal) return null;
    return <VerificationModal />;
}
