import * as React from 'react';
import { memo } from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Play, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    className?: string;
    label?: string;
    children?: React.ReactNode;
    content?: string;
    fileUrl?: string;
    mediaType?: 'image' | 'video';
    imageUrl?: string;
    videoUrl?: string;
    tag?: string;
    variant?: 'default' | 'hover';
    authorName?: string;
    is_verified?: number | boolean;
    timeAgo?: string;
    formattedDate?: string;
    edited?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
    className,
    label,
    children,
    content,
    fileUrl,
    mediaType,
    imageUrl,
    videoUrl,
    tag,
    variant = 'default',
    authorName,
    is_verified,
    timeAgo,
    formattedDate,
    edited,
    ...props
}) => {
    const finalUrl = fileUrl || imageUrl || videoUrl;
    const finalType = mediaType || (videoUrl ? 'video' : 'image');

    const [isPlaying, setIsPlaying] = React.useState(false);
    const [videoBlobUrl, setVideoBlobUrl] = React.useState<string | null>(null);
    const [isProcessing, setIsProcessing] = React.useState(false);

    React.useEffect(() => {
        let activeUrl: string | null = null;
        let isAborted = false;

        const createBlob = async () => {
            if (!isPlaying || !finalUrl || finalType !== 'video') return;

            if (finalUrl.startsWith('data:')) {
                setIsProcessing(true);
                try {
                    const response = await fetch(finalUrl);
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
            if (activeUrl) URL.revokeObjectURL(activeUrl);
        };
    }, [isPlaying, finalUrl, finalType]);

    return (
        <motion.div
            className={cn(
                'bg-white p-2 rounded-lg shadow-chat border border-transparent relative overflow-hidden text-black',
                'rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-sm',
                className
            )}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {/* Tag/Label/Author */}
            {(tag || label || authorName) && (
                <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#00A884] uppercase tracking-wide">
                            {authorName || tag || label}
                        </span>
                        {is_verified === 1 && (
                            <CheckCircle2 size={10} className="text-[#34B7F1] fill-[#34B7F1]/10" />
                        )}
                        {edited && (
                            <span className="text-[8px] text-black/30 font-medium lowercase">
                                • edited
                            </span>
                        )}
                    </div>
                    {timeAgo && (
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[9px] text-black/50 font-mono tracking-tighter">
                                {timeAgo}
                            </span>
                            {formattedDate && (
                                <span className="text-[7px] text-black/30 font-mono uppercase">
                                    {formattedDate}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Content Rendering */}
            <div className="flex flex-col gap-2">
                {finalUrl && finalType === 'image' && (
                    <div className="w-full rounded-md overflow-hidden bg-gray-100 flex items-center justify-center relative shadow-sm border border-gray-100 aspect-video">
                        <Image
                            src={finalUrl}
                            alt="Media"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                )}

                {finalUrl && finalType === 'video' && (
                    !isPlaying ? (
                        <div
                            className="w-full rounded-md overflow-hidden bg-gray-100 flex items-center justify-center relative cursor-pointer group shadow-sm border border-gray-100 aspect-video"
                            onClick={() => setIsPlaying(true)}
                        >
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors z-10">
                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Play className="text-black fill-black ml-1" size={24} />
                                </div>
                            </div>
                            <video src={finalUrl} className="w-full h-full object-cover bg-black/5" />
                        </div>
                    ) : (
                        <div className="w-full rounded-md overflow-hidden bg-black/5 flex flex-col items-center justify-center relative aspect-video">
                            {isProcessing ? (
                                <div className="flex flex-col items-center gap-3 py-8">
                                    <div className="w-8 h-8 border-3 border-[#00A884]/30 border-t-[#00A884] rounded-full animate-spin" />
                                    <p className="text-xs font-medium text-gray-500 animate-pulse uppercase tracking-widest">Processing...</p>
                                </div>
                            ) : (
                                <video
                                    src={videoBlobUrl || finalUrl}
                                    controls
                                    autoPlay
                                    muted
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full rounded-md shadow-sm bg-black"
                                />
                            )}
                        </div>
                    )
                )}

                {content && (
                    <p className="text-sm leading-relaxed text-[#111B21] whitespace-pre-wrap font-sans">
                        {content}
                    </p>
                )}

                {children}
            </div>
        </motion.div>
    );
};

export default memo(GlassCard);
