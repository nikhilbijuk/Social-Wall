import * as React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

import { Play } from 'lucide-react';

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
    const [isPlaying, setIsPlaying] = React.useState(false);

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
                {imageUrl && !isPlaying && (
                    <div
                        className="w-full rounded-md overflow-hidden bg-gray-100 min-h-[100px] flex items-center justify-center relative cursor-pointer group"
                        onClick={() => videoUrl && setIsPlaying(true)}
                    >
                        <img
                            src={imageUrl}
                            alt="Media"
                            loading="lazy"
                            className="w-full h-auto object-cover max-h-[300px]"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://placehold.co/600x400?text=Image+Unavailable';
                                target.onerror = null; // Prevent infinite loop
                            }}
                        />
                        {videoUrl && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play className="text-black fill-black ml-1" size={24} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {videoUrl && isPlaying && (
                    <div className="w-full rounded-md overflow-hidden bg-gray-100 min-h-[100px] flex items-center justify-center">
                        <video
                            src={videoUrl}
                            controls
                            autoPlay
                            preload="auto"
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