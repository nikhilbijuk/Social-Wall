"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
    isLoading: boolean;
    progress?: number;
}

export default function LoadingOverlay({ isLoading, progress }: LoadingOverlayProps) {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-[#EFE7DD]/80 backdrop-blur-md flex flex-col items-center justify-center p-6"
                >
                    <div className="relative w-24 h-24 mb-6">
                        <motion.div
                            className="absolute inset-0 border-4 border-[#00A884]/20 rounded-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        />
                        <motion.div
                            className="absolute inset-0 border-4 border-t-[#00A884] rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-black tracking-tighter text-[#00A884]">
                                {progress ? `${Math.round(progress)}%` : 'INIT'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <h3 className="text-sm font-black tracking-widest text-[#111B21] uppercase">Synchronizing Stream</h3>
                        <p className="text-[10px] font-mono text-black/40 uppercase tracking-widest animate-pulse">Establishing secure connection...</p>
                    </div>

                    {progress !== undefined && (
                        <div className="mt-8 w-48 h-1 bg-black/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#00A884]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
