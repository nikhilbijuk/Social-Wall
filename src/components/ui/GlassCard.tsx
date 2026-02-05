import * as React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    className?: string; // Explicitly adding to fix TS error
    style?: React.CSSProperties;
    variant?: 'default' | 'hover';
    label?: string;
    children?: React.ReactNode;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
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
    videoUrl,
    tag,
    type,
    ...props
}) => {
    return (
        <motion.div
            className={cn(
                'bg-white p-2 rounded-lg shadow-chat border border-transparent relative overflow-hidden text-black',
                'rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-sm', // Chat bubble shape
                className
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            {...props}
        >
            {/* Tag/Label (Optional - kept small) */}
            {(tag || label) && (
                <div className="mb-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                        {tag || label}
                    </span>
                </div>
            )}

            {/* Content Rendering */}
            <div className="flex flex-col gap-2">
                {imageUrl && (
                    <div className="w-full rounded-md overflow-hidden bg-gray-100">
                        <img
                            src={imageUrl}
                            alt="Media"
                            className="w-full h-auto object-cover max-h-[300px]"
                        />
                    </div>
                )}

                {videoUrl && (
                    <div className="w-full rounded-md overflow-hidden bg-gray-100">
                        <video
                            src={videoUrl}
                            controls
                            className="w-full h-auto max-h-[300px]"
                        />
                    </div>
                )}

                {content && (
                    <p className="text-sm leading-relaxed text-dark whitespace-pre-wrap font-sans">
                        {content}
                    </p>
                )}

                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;