"use client";

import { useApp } from "@/context/AppContext";
import { Trophy, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardView() {
    const { leaderboard } = useApp();

    if (!leaderboard) return (
        <div className="flex flex-col gap-3 animate-pulse p-4">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 w-full bg-gray-100 rounded-xl" />
            ))}
        </div>
    );

    const users: any[] = Array.isArray(leaderboard) ? leaderboard : [];

    if (users.length === 0) return (
        <div className="p-4 flex flex-col items-center justify-center gap-2 opacity-40 select-none h-full">
            <Trophy size={28} className="text-gray-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No data yet</span>
        </div>
    );

    return (
        <div className="flex flex-col p-3 gap-3 bg-white/30 backdrop-blur-md h-full border-l border-black/5 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center gap-2 pt-1 pb-2 border-b border-black/5">
                <span className="text-sm">⚡</span>
                <h3 className="text-[10px] font-black tracking-[0.2em] text-black/40 uppercase">Today’s energy</h3>
            </div>

            {/* Score key - more subtle */}
            <div className="flex gap-3 px-1 pb-1 opacity-40">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">❤️ Active</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">📝 Sharing</span>
            </div>

            {/* User rows */}
            <div className="flex flex-col gap-2">
                {users.map((user: any, index: number) => {
                    const medal = MEDALS[index] ?? null;
                    const isTop3 = index < 3;

                    return (
                        <motion.div
                            key={user.id ?? user.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center justify-between p-2.5 rounded-xl border shadow-sm ${isTop3
                                    ? "bg-white border-[#00A884]/20"
                                    : "bg-white/70 border-black/5"
                                }`}
                        >
                            {/* Left: rank + name */}
                            <div className="flex items-center gap-2 min-w-0">
                                {medal ? (
                                    <span className="text-sm shrink-0">{medal}</span>
                                ) : (
                                    <span className="text-[10px] font-black text-black/20 w-4 shrink-0 text-center">
                                        {index + 1}
                                    </span>
                                )}
                                <span className="text-xs font-bold text-black/80 truncate">{user.name}</span>
                                {user.is_verified === 1 && (
                                    <CheckCircle2 size={10} className="text-[#34B7F1] fill-[#34B7F1]/10 shrink-0" />
                                )}
                            </div>

                            {/* Right: score + breakdown */}
                            <div className="flex flex-col items-end shrink-0 ml-2">
                                <span className="text-[11px] font-black text-[#00A884]">
                                    {Number(user.score)} pts
                                </span>
                                <span className="text-[8px] text-gray-400 font-medium whitespace-nowrap">
                                    ❤️{user.hearts} 👍{user.thumbs} 📝{user.total_posts}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
