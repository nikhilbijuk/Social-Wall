"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, RefreshCw, Smartphone } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from "@/lib/utils";
import VerificationModal from '@/components/ui/VerificationModal';

export function Header() {
    const { level, userProfile, setShowVerificationModal, setShowNameModal, generateSyncCode } = useApp();
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
            case 1: return { label: 'Verified Mode - Only verified users can post', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: '🟡' };
            case 2: return { label: 'Broadcast Session - Restricted visibility active', color: 'bg-orange-500/10 text-orange-600 border-orange-200', icon: '🟠' };
            case 3: return { label: 'Admin Lockdown - Wall temporarily restricted', color: 'bg-red-500/10 text-red-600 border-red-200', icon: '🔴' };
            default: return { label: 'Open Wall - Everyone can participate', color: 'bg-green-500/10 text-green-600 border-green-200', icon: '🟢' };
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
                        <div className="flex items-center gap-2 pr-2 pl-1.5 py-1 bg-gray-50 rounded-full border border-gray-100 group">
                            <Link href={`/profile?id=${userProfile.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-white border border-black/5 shrink-0">
                                    <img
                                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${userProfile.name}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-xs font-black uppercase tracking-tighter text-black/60 truncate max-w-[80px]">{userProfile.name}</span>
                                {userProfile.is_verified ? (
                                    <span className="text-blue-500 text-[10px]" title="Verified">✔</span>
                                ) : userProfile.is_trusted ? (
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-1.5 bg-slate-100 rounded border border-slate-200">Connected</span>
                                ) : (
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-amber-500 bg-amber-50 px-1.5 rounded border border-amber-100">Guest</span>
                                )}
                            </Link>
                            
                            {!userProfile.is_trusted && (
                                <button 
                                    onClick={() => import('next-auth/react').then(m => m.signIn('google'))}
                                    className="ml-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#00A884] hover:bg-[#00A884] hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                                >
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
                                    </svg>
                                    Verify
                                </button>
                            )}

                            <button
                                onClick={handleSyncRequest}
                                disabled={isSyncing}
                                className="ml-0.5 p-1 hover:bg-[#00A884]/10 hover:text-[#00A884] transition-all disabled:opacity-50 text-gray-300"
                                title="Sync PC with Mobile"
                            >
                                <Smartphone size={12} className={cn(isSyncing && "animate-pulse text-[#00A884]")} />
                            </button>
                        </div>
                    )}

                    {!userProfile?.is_verified && userProfile?.name && (
                        <button
                            onClick={() => setShowVerificationModal(true)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                            title="Identity Checklist"
                        >
                            <ShieldCheck size={16} />
                        </button>
                    )}
                </div>

                <nav className="flex items-center gap-2 md:gap-3">
                    <Link
                        href="/leaderboard"
                        className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-black/40 hover:text-[#00A884] transition-colors"
                    >
                        <span className="sm:hidden text-lg">🏆</span>
                        <span className="hidden sm:inline">Leaderboard</span>
                    </Link>
                    {!userProfile?.name && (
                         <div className="h-4 w-px bg-gray-200 mx-1"></div>
                    )}
                    {!userProfile?.name && (
                         <button
                           onClick={() => setShowNameModal(true)}
                           className="text-xs font-black uppercase tracking-widest text-black/60 hover:text-[#00A884] transition-colors"
                         >
                            Join Wall
                         </button>
                    )}
                    {userProfile?.is_admin && (
                        <Link href="/admin" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-red-500 hover:scale-105 transition-all bg-red-50 px-2 md:px-3 py-1.5 rounded-lg border border-red-100">Admin</Link>
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
