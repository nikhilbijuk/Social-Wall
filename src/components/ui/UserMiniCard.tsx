"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Shield, Heart, MessagesSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserMiniCardProps {
    user: {
        id: string;
        name: string;
        is_verified: boolean | number;
        is_trusted?: boolean | number;
        is_admin?: boolean | number;
        recent_activity?: string;
        engagement_count?: number;
    };
    onClose: () => void;
}

export function UserMiniCard({ user, onClose }: UserMiniCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[100] mt-2 w-64 bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden p-4 select-none"
            onClick={(e) => e.stopPropagation()}
        >
            <button 
                onClick={onClose}
                className="absolute top-3 right-3 p-1 text-black/20 hover:text-black/40 transition-colors"
            >
                <X size={14} />
            </button>

            <div className="flex flex-col items-center text-center gap-3 pt-2">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-50">
                    <img
                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Identity */}
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black uppercase tracking-tight text-[#00A884]">
                            @{user.name.toLowerCase().replace(/\s+/g, '')}
                        </span>
                        {user.is_verified === 1 && (
                            <CheckCircle2 size={12} className="text-[#34B7F1] fill-[#34B7F1]/10" />
                        )}
                        {user.is_admin === 1 && (
                            <Shield size={12} className="text-red-500" />
                        )}
                    </div>
                    {user.is_verified === 1 ? (
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Verified Voice</span>
                    ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classmate</span>
                    )}
                </div>

                <hr className="w-full border-black/5" />

                {/* Stats / Status */}
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase tracking-widest">
                            <Heart size={10} />
                            Noticed by
                        </div>
                        <span className="text-[10px] font-black text-[#00A884]">
                            {user.engagement_count || 12} classmates
                        </span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase tracking-widest">
                            <MessagesSquare size={10} />
                            Activity
                        </div>
                        <span className="text-[10px] font-black text-slate-600">
                            {user.recent_activity || "Shared recently"}
                        </span>
                    </div>
                </div>

                <div className="w-full mt-1">
                    <div className="bg-[#00A884]/5 rounded-xl py-2 px-3 text-[10px] font-medium text-[#00A884]/70 italic-none">
                        Active in our class today ✨
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
