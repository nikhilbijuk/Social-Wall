"use client";

import { useApp } from "@/context/AppContext";
import { Trophy, Users, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function LeaderboardView() {
    const { leaderboard } = useApp();

    if (!leaderboard) return (
        <div className="flex flex-col gap-4 animate-pulse p-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            {[1, 2, 3].map(i => (
                <div key={i} className="h-12 w-full bg-gray-100 rounded" />
            ))}
        </div>
    );

    return (
        <div className="space-y-8 p-4 bg-white/30 backdrop-blur-md h-full border-l border-black/5">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Users size={16} className="text-[#34B7F1]" />
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-black/40 uppercase">Top Teams</h3>
                </div>
                <div className="space-y-2">
                    {leaderboard.teams.map((team: any) => (
                        <motion.div
                            key={team.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-black/5 shadow-sm"
                        >
                            <span className="text-xs font-bold text-black/80">{team.name}</span>
                            <span className="text-[10px] font-black text-[#34B7F1]">{team.team_points} pts</span>
                        </motion.div>
                    ))}
                </div>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Trophy size={16} className="text-[#00A884]" />
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-black/40 uppercase">Top Members</h3>
                </div>
                <div className="space-y-2">
                    {leaderboard.users.map((user: any, index: number) => (
                        <motion.div
                            key={user.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-black/5 shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-black/20 w-4">{index + 1}</span>
                                <span className="text-xs font-bold text-black/80">{user.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-[#00A884]">{user.total_points} likes</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
