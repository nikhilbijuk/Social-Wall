import * as React from 'react';
import { memo } from 'react';
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
    const [videoBlobUrl, setVideoBlobUrl] = React.useState<string | null>(null);
    const [isProcessing, setIsProcessing] = React.useState(false);

    React.useEffect(() => {
        let activeUrl: string | null = null;
        let isAborted = false;

        const createBlob = async () => {
            if (!isPlaying || !videoUrl) return;

            if (videoUrl.startsWith('data:')) {
                setIsProcessing(true);
                try {
                    // Fetch is more memory efficient than atob for large strings
                    // and handles the decoding in the browser's background pool
                    const response = await fetch(videoUrl);
                    const blob = await response.blob();

                    if (!isAborted) {
                        activeUrl = URL.createObjectURL(blob);
                        setVideoBlobUrl(activeUrl);
                        setIsProcessing(false);
                    }
                } catch (error) {
                    if (!isAborted) {
                        console.error("Failed to create video blob URL:", error);
                        setIsProcessing(false);
                    }
                }
            } else {
                setIsProcessing(false);
            }
        };

        createBlob();

        return () => {
            isAborted = true;
            if (activeUrl) {
                URL.revokeObjectURL(activeUrl);
            }
        };
    }, [isPlaying, videoUrl]);

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
                    <div className="w-full rounded-md overflow-hidden bg-black/5 min-h-[150px] flex flex-col items-center justify-center p-2 relative">
                        {isProcessing ? (
                            <div className="flex flex-col items-center gap-3 py-8">
                                <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                                <p className="text-xs font-medium text-gray-500 animate-pulse">
                                    Optimizing video for playback...
                                </p>
                            </div>
                        ) : (
                            <video
                                src={videoBlobUrl || videoUrl}
                                controls
                                autoPlay
                                muted
                                playsInline
                                preload="auto"
                                className="w-full h-auto max-h-[400px] rounded-md shadow-sm"
                                onError={(e) => {
                                    console.error("Video playback error:", e);
                                    const target = e.target as HTMLVideoElement;
                                    if (target.error) {
                                        console.error("Video Error Code:", target.error.code);
                                        console.error("Video Error Message:", target.error.message);
                                    }
                                }}
                            />
                        )}
                        {(videoUrl.startsWith('data:') && videoUrl.length > 2000000 && !isProcessing) && (
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[9px] text-white/90 font-bold tracking-wider uppercase">
                                HD
                            </div>
                        )}
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

export default memo(GlassCard);