"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function TrendingCard() {
    const [trending, setTrending] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    const fetchTrending = async () => {
        try {
            const res = await fetch("/api/trending");
            if (res.ok) {
                const data = await res.json();
                if (data.trending && data.trending.id) {
                    setTrending(data.trending);
                } else {
                    setTrending(null);
                }
                setIsVisible(true);
            }
        } catch (error) {
            console.error("Failed to fetch trending:", error);
        }
    };

    useEffect(() => {
        fetchTrending();
        // Poll every 20 seconds
        const interval = setInterval(fetchTrending, 20000);
        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="w-full max-w-xl mx-auto mt-2 mb-4 animate-in slide-in-from-top-4 fade-in duration-500 relative z-20">
             <div className="rounded-xl p-3 bg-white/95 backdrop-blur-md shadow-lg border border-[#00A884]/20 relative overflow-hidden group animate-pulse-subtle">
                 {/* Premium subtle gradient background */}
                 <div className="absolute inset-0 bg-gradient-to-br from-[#00A884]/5 to-transparent pointer-events-none" />
                 
                 <div className="flex items-center justify-between mb-1 relative z-10">
                     <div className="flex items-center gap-1.5">
                         <span className="text-sm">🔥</span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                             Trending Right Now
                         </span>
                     </div>
                     <span className="text-[9px] font-medium text-black/40">
                         {dayjs(trending.created_at).fromNow()}
                     </span>
                 </div>

                 {trending ? (
                     <div className="flex items-start gap-3 mt-2 relative z-10 transition-all">
                         <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-black/5 bg-gray-50">
                             <img 
                                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${trending.user_id}`} 
                                alt="Avatar" 
                                className="w-full h-full object-cover"
                             />
                         </div>
                         <div className="flex-1 min-w-0">
                             <div className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug break-words">
                                 {trending.content || <span className="italic text-gray-400">Media Post</span>}
                             </div>
                             <div className="flex items-center gap-3 mt-2">
                                 <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600 bg-gray-100/50 px-2 py-0.5 rounded-full border border-gray-200/50 flex flex-row">
                                     <span>❤️</span> {trending.likes_count || 0}
                                 </div>
                                 <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600 bg-gray-100/50 px-2 py-0.5 rounded-full border border-gray-200/50 flex flex-row">
                                     <span>👍</span> {trending.thumbs_up_count || 0}
                                 </div>
                             </div>
                         </div>
                     </div>
                 ) : (
                     <div className="flex items-center justify-center p-4 mt-2 mb-1 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 relative z-10">
                         <span className="text-sm font-medium text-gray-400 italic">No post trending yet</span>
                     </div>
                 )}
             </div>
        </div>
    );
}
