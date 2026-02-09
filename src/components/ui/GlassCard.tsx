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
    const [videoBlobUrl, setVideoBlobUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        let activeUrl: string | null = null;

        if (isPlaying && videoUrl && videoUrl.startsWith('data:')) {
            try {
                const parts = videoUrl.split(',');
                const byteString = atob(parts[1]);
                const mimeString = parts[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });
                activeUrl = URL.createObjectURL(blob);
                setVideoBlobUrl(activeUrl);
            } catch (error) {
                console.error("Failed to create video blob URL:", error);
            }
        }

        return () => {
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
                    <div className="w-full rounded-md overflow-hidden bg-gray-100 min-h-[100px] flex flex-col items-center justify-center p-2">
                        <video
                            src={videoBlobUrl || videoUrl}
                            controls
                            autoPlay
                            muted
                            playsInline
                            preload="auto"
                            className="w-full h-auto max-h-[300px] rounded-md"
                            onError={(e) => {
                                console.error("Video playback error:", e);
                                const target = e.target as HTMLVideoElement;
                                if (target.error) {
                                    console.error("Video Error Code:", target.error.code);
                                    console.error("Video Error Message:", target.error.message);
                                }
                            }}
                        />
                        {(!videoBlobUrl && videoUrl.length > 1000000) && (
                            <p className="text-[10px] text-gray-500 mt-2">
                                Processing large video... Please wait.
                            </p>
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

export default GlassCard;