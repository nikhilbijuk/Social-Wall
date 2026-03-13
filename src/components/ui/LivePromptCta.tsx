"use client";

import { useEffect, useState } from "react";
import { MessagesSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LivePromptCta() {
    const [prompt, setPrompt] = useState<string | null>(null);
    const [lastPrompt, setLastPrompt] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrompt = async () => {
            try {
                const res = await fetch('/api/live-prompt');
                const data = await res.json();
                if (data.prompt) {
                    setPrompt(data.prompt);
                } else {
                    setPrompt("Share what you're enjoying right now 🔥");
                }
            } catch (err) {
                console.error("Failed to fetch live prompt:", err);
            }
        };

        fetchPrompt();
        const interval = setInterval(fetchPrompt, 15000); // Check every 15s for admin updates
        return () => clearInterval(interval);
    }, []);

    // Detect prompt change for a pulse animation
    useEffect(() => {
        if (prompt && prompt !== lastPrompt) {
            setLastPrompt(prompt);
        }
    }, [prompt, lastPrompt]);

    if (!prompt) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={prompt}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="max-w-4xl mx-auto w-full mb-1 relative overflow-hidden"
            >
                {/* Subtle outer glow effect using shadow rather than hard gradients */}
                <div className="relative isolate px-5 py-4 rounded-2xl bg-gradient-to-br from-[#FFF8E7] to-[#FFF0D4] border border-[#FFE4A0] shadow-[0_4px_24px_-4px_rgba(255,215,0,0.2)]">
                    
                    {/* Animated background sheen */}
                    <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 2 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
                    />

                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-10 h-10 shrink-0 bg-[#FFB800]/10 rounded-full flex items-center justify-center border border-[#FFB800]/20 shadow-inner">
                            <MessagesSquare size={18} className="text-[#E6A600]" />
                        </div>
                        
                        <div className="flex flex-col flex-1 pt-0.5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#D97706] flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
                                    Live Prompt
                                </span>
                            </div>
                            <h3 className="text-[15px] font-bold text-[#92400E] leading-snug">
                                {prompt}
                            </h3>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
