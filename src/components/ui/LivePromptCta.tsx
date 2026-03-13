"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { MessagesSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LivePromptCta() {
    const { userProfile } = useApp();
    const [prompt, setPrompt] = useState<string | null>(null);
    const [results, setResults] = useState<{choice_index: number, count: number}[]>([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [votedIndex, setVotedIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchPrompt = async () => {
            try {
                const res = await fetch('/api/live-prompt');
                const data = await res.json();
                if (data.prompt) {
                    setPrompt(data.prompt);
                    // Fetch results
                    const resResults = await fetch(`/api/pulse/vote?promptId=1`);
                    const dataResults = await resResults.json();
                    if (dataResults.results) setResults(dataResults.results);
                } else {
                    setPrompt("Share what you're enjoying right now 🔥");
                }
            } catch (err) {
                console.error("Failed to fetch Pulse:", err);
            }
        };

        fetchPrompt();
        const interval = setInterval(fetchPrompt, 300000); // Poll every 5 minutes for campus 
        return () => clearInterval(interval);
    }, []);

    const handleVote = async (index: number) => {
        if (!userProfile?.id || hasVoted) return;
        setHasVoted(true);
        setVotedIndex(index);
        
        try {
            await fetch('/api/pulse/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userProfile.id,
                    promptId: 1, // Simplified
                    choiceIndex: index
                })
            });
            // Re-fetch results
            const res = await fetch(`/api/pulse/vote?promptId=1`);
            const data = await res.json();
            if (data.results) setResults(data.results);
        } catch (err) {
            console.error("Vote failed:", err);
        }
    };

    if (!prompt) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={prompt}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="max-w-4xl mx-auto w-full mb-6 relative overflow-hidden"
            >
                <div className="relative isolate p-4 rounded-2xl bg-gradient-to-br from-[#FFF8E7] to-[#FFF0D4] border border-[#FFE4A0] shadow-[0_4px_24px_-4px_rgba(255,215,0,0.2)]">
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-10 h-10 shrink-0 bg-[#FFB800]/10 rounded-full flex items-center justify-center border border-[#FFB800]/20 shadow-inner">
                            <MessagesSquare size={18} className="text-[#E6A600]" />
                        </div>
                        
                        <div className="flex flex-col flex-1 pt-0.5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#D97706] flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
                                    Today's Pulse
                                </span>
                            </div>
                            <h3 className="text-[15px] font-bold text-[#92400E] leading-snug">
                                {prompt}
                            </h3>

                            <div className="flex flex-wrap gap-2 mt-3">
                                {['😄 Chill', '🔥 Ready', '😵 Busy', '😴 Sleepy'].map((choice, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleVote(i)}
                                        disabled={hasVoted}
                                        className={cn(
                                            "h-10 px-4 rounded-full text-[11px] font-bold transition-all border flex items-center justify-center gap-2",
                                            votedIndex === i 
                                                ? "bg-amber-500 text-white border-amber-600 shadow-sm scale-105"
                                                : hasVoted 
                                                    ? "bg-amber-50 text-amber-900/40 border-amber-100 opacity-60"
                                                    : "bg-white/50 text-amber-900 border-amber-200 hover:bg-white"
                                        )}
                                    >
                                        {choice}
                                        {results.find(r => r.choice_index === i) && (
                                            <span className="ml-1.5 opacity-60">
                                                {results.find(r => r.choice_index === i)?.count || 0}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <AnimatePresence>
                                {hasVoted && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 pt-3 border-t border-amber-200/50"
                                    >
                                        <button 
                                            onClick={() => {
                                                const input = document.querySelector('textarea');
                                                if (input) {
                                                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    input.focus();
                                                }
                                            }}
                                            className="text-[11px] font-black uppercase tracking-[0.15em] text-[#92400E] flex items-center gap-2 hover:translate-x-1 transition-transform"
                                        >
                                            Say what you think <span className="text-lg">➡️</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
