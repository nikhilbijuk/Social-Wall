"use client";

import { useEffect, useState } from "react";
import { Sparkles, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SpotlightCard() {
    const [spotlight, setSpotlight] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSpotlight = async () => {
            try {
                const res = await fetch('/api/spotlight');
                const data = await res.json();
                
                if (data.spotlight) {
                    setSpotlight(data.spotlight);
                } else {
                    setSpotlight(null);
                }
            } catch (err) {
                console.error("Failed to fetch spotlight:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSpotlight();
        const interval = setInterval(fetchSpotlight, 600000); // Check every 10 minutes for campus rhythm
        return () => clearInterval(interval);
    }, []);

    if (isLoading || !spotlight) return null;

    return (
        <AnimatePresence>
            <motion.div
                key={spotlight.id} // Re-animate if post changes
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="max-w-4xl mx-auto w-full mb-3"
            >
                <div className="relative overflow-hidden rounded-[24px] bg-white/70 backdrop-blur-xl border border-white p-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] group">
                    
                    {/* Subtle outer glow that rotates slightly on hover via CSS classes */}
                    <div className="absolute -inset-[50%] opacity-20 bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-[spin_8s_linear_infinite] pointer-events-none" />
                    
                    <div className="relative bg-gradient-to-br from-white to-[#F8FAFC] rounded-[24px] p-4 border border-indigo-50/50">
                        {/* Header Label */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                                <Sparkles size={12} className="text-indigo-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                                Student Spotlight
                            </span>
                            
                            {spotlight.is_verified ? (
                                <span className="ml-auto text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 tracking-wider">
                                    Featured Voice
                                </span>
                            ) : null}
                        </div>

                        {/* Content Area */}
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-gray-50">
                                {spotlight.avatar_url ? (
                                    <img src={spotlight.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${spotlight.author_name || 'anon'}`} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <p className="text-sm font-bold text-gray-900 leading-relaxed break-words line-clamp-2">
                                    {spotlight.content || <span className="italic text-gray-400">Media only</span>}
                                </p>
                                
                                {spotlight.file_url && (
                                     <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#00A884]">
                                        <ImageIcon size={10} />
                                        <span>Attached Media</span>
                                     </div>
                                )}
                                
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-[11px] font-bold text-gray-500">{spotlight.author_name || 'Guest'}</span>
                                    {spotlight.is_trusted ? (
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-1.5 bg-slate-100 rounded border border-slate-200">Connected</span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
