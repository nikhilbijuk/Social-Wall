import React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

// 1. Updated Interface to accept post properties
interface GlassCardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'hover';
    label?: string;
    children?: React.ReactNode;
    // Added these to catch the spread props from ExplorePage
    content?: string;
    imageUrl?: string;
    tag?: string;
    type?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
    className, 
    variant = 'default', 
    label, 
    children, 
    content, 
    imageUrl, 
    tag, 
    type, 
    ...props 
}) => {
    return (
        <motion.div
            className={cn(
                'modular-card p-6 bg-card border border-white/10 flex flex-col min-h-[200px] relative overflow-hidden',
                variant === 'hover' && 'hover:border-primary/40 group cursor-pointer',
                className
            )}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            {...props}
        >
            {/* 2. Top Bar Logic (Label or Tag) */}
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <span className="label-mono uppercase text-pink-500 text-[10px] tracking-widest">
                    {tag || label || type || 'SYSTEM_LOG'}
                </span>
                <div className="flex gap-1">
                   <div className="w-1 h-1 bg-white/20 rounded-full" />
                   <div className="w-1 h-1 bg-pink-500/40 rounded-full" />
                </div>
            </div>

            {/* 3. Automatic Post Content Rendering */}
            <div className="relative z-10 flex-1 flex flex-col gap-4">
                {imageUrl && (
                    <div className="w-full h-40 overflow-hidden rounded-lg border border-white/5 bg-black/20">
                        <img 
                            src={imageUrl} 
                            alt="Post Media" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                    </div>
                )}
                
                {content && (
                    <p className="text-white/80 text-sm leading-relaxed font-light">
                        {content}
                    </p>
                )}

                {/* This allows you to still add extra buttons/elements from ExplorePage */}
                {children}
            </div>

            {/* Mechanical Decorative Accents */}
            <div className="absolute bottom-0 right-0 p-1 opacity-20 transition-opacity group-hover:opacity-100 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 11L11 1" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M11 11L1 1" stroke="currentColor" strokeWidth="0.5" />
                </svg>
            </div>
        </motion.div>
    );
};

export default GlassCard;