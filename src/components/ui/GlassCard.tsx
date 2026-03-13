import * as React from 'react';
import { memo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Play, CheckCircle2, X, Lock, AlertTriangle, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
    is_viral?: boolean;
    id?: string;
}

const GlassCard: React.FC<GlassCardProps> = memo(({
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
    blur_reason,
    createdAt,
    timestamp,
    edited,
    is_viral,
    id, // assumed id is available in props from spread
    ...restProps
}) => {
    const { userProfile, level, setShowVerificationModal } = useApp();
    const finalUrl = fileUrl || imageUrl || videoUrl;
    const finalType = mediaType || (videoUrl ? 'video' : 'image');

    const [isPlaying, setIsPlaying] = useState(false);
    const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const isMe = userProfile?.id && (authorId === userProfile.id);
    
    // Optimistic UI state
    const [optimisticDeepfake, setOptimisticDeepfake] = useState(is_deepfake === 1);
    const [optimisticBlur, setOptimisticBlur] = useState(is_blur === 1);
    
    // Sync with props when they change from server
    useEffect(() => { setOptimisticDeepfake(is_deepfake === 1); }, [is_deepfake]);
    useEffect(() => { setOptimisticBlur(is_blur === 1); }, [is_blur]);

    const blurred = shouldBlur({ is_blur: optimisticBlur ? 1 : 0 }, userProfile, level);

    const handleModerate = async (field: 'is_deepfake' | 'is_blur') => {
        const fallbackId = (restProps as any).id;
        if (!fallbackId && !id) return; // Need post ID to moderate
        const postId = (id || fallbackId) as string;
        
        const newValue = field === 'is_deepfake' ? !optimisticDeepfake : !optimisticBlur;
        
        // Optimistic update
        if (field === 'is_deepfake') setOptimisticDeepfake(newValue);
        if (field === 'is_blur') setOptimisticBlur(newValue);
        
        try {
            const res = await fetch('/api/admin/moderate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, field, value: newValue ? 1 : 0 })
            });
            if (!res.ok) throw new Error('Failed to moderate');
        } catch (error) {
            console.error(error);
            // Revert on failure
            if (field === 'is_deepfake') setOptimisticDeepfake(!newValue);
            if (field === 'is_blur') setOptimisticBlur(!newValue);
            alert("Failed to moderate post.");
        }
    };

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
            {...restProps}
        >
            {optimisticDeepfake && (
                <div className="flex flex-col animate-in fade-in duration-700 ease-in-out">
                     {/* Layer A - Alert Strip */}
                     <div className="bg-red-500/10 border-b border-red-500/20 px-3 py-1.5 flex items-center justify-center gap-2">
                        <span className="text-red-500"><AlertTriangle size={14} /></span>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Content Authenticity Warning</span>
                     </div>
                     {/* Layer B - Explanation */}
                     <div className="bg-red-500/5 px-3 py-1.5 text-center border-b border-red-500/10">
                        <span className="text-[9px] font-medium text-red-700/80">This media has been flagged by moderation for possible AI manipulation.</span>
                     </div>
                     {/* Layer C - Badge */}
                     <div className="absolute top-2 right-2 p-1 bg-white/90 shadow-sm border border-red-100 rounded flex items-center gap-1 z-10 backdrop-blur-sm">
                         <AlertTriangle size={10} className="text-red-500" />
                         <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Flagged</span>
                     </div>
                </div>
            )}
            {!optimisticDeepfake && is_viral && (
                 <div className="absolute top-0 right-0 p-1 bg-orange-500/10 rounded-bl-lg">
                      <span className="text-[8px] font-black text-orange-500 uppercase tracking-tighter">🔥 Viral</span>
                 </div>
            )}
            
            {/* Header: Avatar, Name, Stats */}
            <div className={cn("mb-1 flex items-center justify-between", optimisticDeepfake ? "pt-2 px-2" : "")}>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 border border-black/5 shrink-0">
                        <img
                            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${authorName || 'Guest'}`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#00A884] uppercase tracking-wide">
                            {authorName || tag || label || 'Guest'}
                        </span>
                        {is_verified === 1 && (
                            <span className="text-blue-500 text-[10px] font-black" title="Verified">✔</span>
                        )}
                        {is_viral && (
                            <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse flex items-center gap-1 shadow-sm">
                                🔥 VIRAL
                            </span>
                        )}
                        {edited && (
                            <span className="text-[8px] text-black/30 font-medium lowercase">
                                • edited
                            </span>
                        )}
                        {userProfile?.is_admin === 1 && (
                            <div className="flex items-center gap-0.5 ml-2 opacity-10 md:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleModerate('is_deepfake'); }}
                                    className={cn("p-1 rounded hover:bg-red-500/10 text-black/40 hover:text-red-500 transition-colors", optimisticDeepfake && "text-red-500")}
                                    title="Toggle Deepfake Alert"
                                >
                                    <AlertTriangle size={12} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleModerate('is_blur'); }}
                                    className={cn("p-1 rounded hover:bg-orange-500/10 text-black/40 hover:text-orange-500 transition-colors", optimisticBlur && "text-orange-500")}
                                    title="Toggle Content Blur"
                                >
                                    <EyeOff size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {(createdAt || timestamp) && (
                    <div className="flex items-center gap-1.5 opacity-70">
                        <span className="text-[10px] text-gray-500 font-mono tracking-tight font-medium">
                            {createdAt ? dayjs(createdAt).fromNow() : dayjs(Number(timestamp)).fromNow()}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Rendering */}
            <div className={cn("flex flex-col gap-2 relative", optimisticDeepfake ? "px-2 pb-2" : "")}>
                {blurred ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 bg-gray-900/90 rounded-xl border border-white/10 backdrop-blur-xl w-full relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50"></div>
                        
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/90 z-10 shadow-lg border border-white/5">
                            <Lock size={20} />
                        </div>
                        
                        <div className="z-10 space-y-1">
                            <h3 className="text-white font-black tracking-tight text-sm">Verified Access Required</h3>
                            <p className="text-[11px] text-white/70 max-w-[200px] leading-snug">
                                {blur_reason || "This content is available only to verified users."}
                            </p>
                        </div>
                        
                        {!userProfile?.is_verified && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowVerificationModal(true); }}
                                className="z-10 mt-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                            >
                                Request Verification
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {finalUrl && finalType === 'image' && (
                            <div
                                className="w-full min-h-[220px] rounded-md overflow-hidden bg-black/5 flex items-center justify-center relative cursor-pointer border border-gray-100/50 shadow-sm select-none"
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
                                    className="w-full min-h-[220px] rounded-md overflow-hidden bg-black/5 flex items-center justify-center relative cursor-pointer group border border-gray-100/50 shadow-sm select-none"
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
                            <div className="text-sm leading-relaxed text-[#111B21] whitespace-pre-wrap font-sans">
                                {content.split(/(@[a-zA-Z0-9_]+)/g).map((part, i) => {
                                    if (part.startsWith('@') && part.length > 1) {
                                        const username = part.slice(1);
                                        return (
                                            <Link key={i} href={`/profile?tag=${username}`} className="font-bold text-[#00A884] hover:underline" onClick={(e) => e.stopPropagation()}>
                                                {part}
                                            </Link>
                                        );
                                    }
                                    return <span key={i}>{part}</span>;
                                })}
                            </div>
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
});

GlassCard.displayName = "GlassCard";

export default GlassCard;
