import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
    isLoading: boolean;
    progress: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, progress }) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
                >
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Background Circle */}
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-200"
                            />
                            {/* Progress Circle */}
                            <motion.circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={351.8}
                                initial={{ strokeDashoffset: 351.8 }}
                                animate={{ strokeDashoffset: 351.8 * (1 - progress / 100) }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="text-primary"
                            />
                        </svg>

                        {/* Percentage Text */}
                        <div className="text-xl font-bold text-gray-800">
                            {Math.round(progress)}%
                        </div>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 text-sm font-medium text-gray-500 uppercase tracking-widest"
                    >
                        Sychronizing Social Wall
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingOverlay;
