import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SinceYouWereAway() {
    const [summary, setSummary] = useState<{ newPosts: number; latestName?: string } | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const lastSeen = localStorage.getItem("last_seen_wall") || Date.now().toString();
        
        const fetchSummary = async () => {
            const res = await fetch(`/api/posts/summary?lastSeen=${lastSeen}`);
            const data = await res.json();
            if (data.summary && data.summary.newPosts > 0) {
                setSummary(data.summary);
                setIsVisible(true);
            }
        };

        fetchSummary();
        
        // Update last seen after 2 minutes of browsing
        const timer = setTimeout(() => {
            localStorage.setItem("last_seen_wall", Date.now().toString());
        }, 120000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible || !summary) return null;

    return (
        <div className="w-full max-w-xl mx-auto mb-6 animate-in slide-in-from-top-2 duration-700 group">
            <div className="bg-slate-50/80 backdrop-blur-md border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Since you were away</span>
                    <div className="flex items-center gap-1.5 peer">
                        <span className="text-[13px] font-bold text-slate-700">
                            {summary.latestName ? `${summary.latestName} and others posted` : `${summary.newPosts} new posts from classmates`}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-[#00A884] uppercase tracking-widest">You got noticed today ✨</span>
                    </div>
                </div>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="h-9 px-3 flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}
