import * as React from 'react';
import { memo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Play, CheckCircle2, X, Lock } from 'lucide-react';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useApp } from '@/context/AppContext';
import { shouldBlur } from '@/lib/permissions';

dayjs.extend(relativeTime);

interface GlassCardProps extends HTMLMotionProps<"div"> {
    className?: string;
    label?: string;
    children?: React.ReactNode;
    content?: string;
    fileUrl?: string;
    authorId?: string;
    mediaType?: 'image' | 'video';
    imageUrl?: string;
    videoUrl?: string;
    tag?: string;
    variant?: 'default' | 'hover';
    authorName?: string;
    is_verified?: number | boolean;
    is_deepfake?: number;
    is_blur?: number;
    blur_reason?: string;
    createdAt?: string;
    timestamp?: number;
    edited?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
    className,
    label,
    children,
    content,
    fileUrl,
    authorId,
    mediaType,
    imageUrl,
    videoUrl,
    tag,
    variant = 'default',
    authorName,
    is_verified,
    is_deepfake,
    is_blur,
    createdAt,
    timestamp,
    edited,
    ...props
}) => {
    const { userProfile } = useApp();
    const finalUrl = fileUrl || imageUrl || videoUrl;
    const finalType = mediaType || (videoUrl ? 'video' : 'image');

    const [isPlaying, setIsPlaying] = useState(false);
    const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const isMe = userProfile?.id && (authorId === userProfile.id);
    const blurred = shouldBlur({ is_blur }, userProfile);

    useEffect(() => {
        let activeUrl: string | null = null;
        let isAborted = false;

        const createBlob = async () => {
            if (!isPlaying || !finalUrl || finalType !== 'video') return;
            if (blurred) return; // Don't fetch if blurred

            // Only attempt blob wrapping for local Data URIs (previews)
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
                // If it's an external URL (UploadThing), skip blob creation entirely to avoid CORS issues
                setIsProcessing(false);
                setVideoBlobUrl(null);
            }
        };

        createBlob();

        return () => {
            isAborted = true;
            if (activeUrl) URL.revokeObjectURL(activeUrl);
        };
    }, [isPlaying, finalUrl, finalType, blurred]);

    return (
        <motion.div
            className={cn(
                'p-2 rounded-lg shadow-chat border border-transparent relative overflow-hidden text-black',
                'rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-sm',
                isMe ? 'bg-[#D9FDD3] self-end rounded-tr-sm rounded-br-lg' : 'bg-white self-start',
                className
            )}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {is_deepfake === 1 && (
                <div className="absolute top-0 right-0 p-1 bg-red-500/10 rounded-bl-lg">
                    <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">⚠ Deepfake</span>
                </div>
            )}
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
                    {(createdAt || timestamp) && (
                        <div className="flex items-center gap-1.5 opacity-70">
                            <span className="text-[10px] text-gray-500 font-mono tracking-tight font-medium">
                                {createdAt ? dayjs(createdAt).fromNow() : dayjs(Number(timestamp)).fromNow()}
                            </span>
                            <span className="text-gray-300 text-[10px]">•</span>
                            <span className="text-[9px] text-gray-400 font-mono uppercase tracking-widest">
                                {createdAt ? dayjs(createdAt).format('ddd hh:mm A') : dayjs(Number(timestamp)).format('ddd hh:mm A')}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Content Rendering */}
            <div className="flex flex-col gap-2 relative">
                {blurred ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-black/5 rounded-lg border border-dashed border-black/10 backdrop-blur-md w-full">
                        <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-black/40">
                            <Lock size={18} />
                        </div>
                        <p className="text-[10px] font-bold text-black/60 leading-tight">
                            Content visible to <span className="text-[#00A884]">verified users</span> only
                        </p>
                        <p className="text-[9px] text-black/40 italic">
                            {props.blur_reason || "Sensitive or unverified media content"}
                        </p>
                    </div>
                ) : (
                    <>
                        {finalUrl && finalType === 'image' && (
                            <div
                                className="w-full rounded-md overflow-hidden bg-black/5 flex items-center justify-center relative cursor-pointer border border-gray-100/50 shadow-sm select-none"
                                onClick={() => setIsFullscreen(true)}
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                <img
                                    src={finalUrl}
                                    alt="Media"
                                    className="max-w-full max-h-[70vh] object-contain pointer-events-none"
                                    loading="eager"
                                    draggable={false}
                                    onContextMenu={(e) => e.preventDefault()}
                                />
                            </div>
                        )}

                        {finalUrl && finalType === 'video' && (
                            !isPlaying ? (
                                <div
                                    className="w-full rounded-md overflow-hidden bg-black/5 flex items-center justify-center relative cursor-pointer group border border-gray-100/50 shadow-sm select-none"
                                    onClick={() => { setIsPlaying(true); setIsFullscreen(true); }}
                                    onContextMenu={(e) => e.preventDefault()}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors z-10 pointer-events-none">
                                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play className="text-black fill-black ml-1" size={24} />
                                        </div>
                                    </div>
                                    <video
                                        src={finalUrl}
                                        className="max-w-full max-h-[70vh] object-contain pointer-events-none"
                                        playsInline
                                        muted
                                        preload="metadata"
                                        onContextMenu={(e) => e.preventDefault()}
                                    />
                                    {/* Explicit overlay for mobile touch capture */}
                                    <div className="absolute inset-0 z-20" />
                                </div>
                            ) : (
                                <div className="w-full rounded-md overflow-hidden bg-black/5 flex flex-col items-center justify-center relative border border-gray-100/50 shadow-sm">
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
                                            className="max-w-full max-h-[70vh] object-contain"
                                            controlsList="nodownload nofullscreen"
                                            onContextMenu={(e) => e.preventDefault()}
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
                    </>
                )}

                {children}
            </div>

            {/* Fullscreen Lightbox Portal */}
            {isFullscreen && typeof window !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setIsFullscreen(false)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-200 z-[110]"
                    >
                        <X size={24} />
                    </button>

                    <div
                        className="relative w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {finalType === 'image' ? (
                            <img
                                src={finalUrl}
                                alt="Fullscreen Media"
                                className="max-w-full max-h-full object-contain rounded-md shadow-2xl select-none"
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        ) : (
                            <video
                                src={videoBlobUrl || finalUrl}
                                controls
                                playsInline
                                autoPlay
                                className="max-w-full max-h-[85vh] rounded-md shadow-2xl bg-black"
                                controlsList="nodownload nofullscreen"
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        )}
                    </div>
                </div>,
                document.body
            )}
        </motion.div>
    );
};

export default memo(GlassCard);
