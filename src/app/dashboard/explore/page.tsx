"use client";

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import GlassCard from '@/components/ui/GlassCard';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';

export default function ExplorePage() {
    const { posts, handleLike, handleThumbUp, isLoading, loadingProgress, hasMore, loadMorePosts, createPost } = useApp();
    const [text, setText] = useState('');

    // File States
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const { startUpload } = useUploadThing("mediaUploader", {
        onUploadProgress: (p) => setUploadProgress(p)
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setFileType(file.type.startsWith('video/') ? 'video' : 'image');

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const clearAttachment = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePost = async () => {
        if (!text.trim() && !selectedFile) return;

        setIsUploading(true);
        let fileUrl = '';
        let mediaType: 'image' | 'video' | undefined = undefined;

        try {
            if (selectedFile) {
                const res = await startUpload([selectedFile]);
                if (res && res[0]) {
                    fileUrl = res[0].url;
                    mediaType = fileType as 'image' | 'video';
                }
            }

            await createPost({
                content: text,
                fileUrl,
                mediaType,
            });

            setText('');
            clearAttachment();
        } catch (err) {
            console.error("Failed to post:", err);
            alert("Failed to create post. Please try again.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMorePosts();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isLoading, loadMorePosts]);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#EFE7DD] relative">
            <LoadingOverlay isLoading={isLoading && posts.length === 0} progress={loadingProgress} />

            {/* Background Pattern Overlay matching Vite */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 scrollbar-hide">
                {posts.map((post) => (
                    <div key={post.id} className="flex flex-col gap-1 max-w-[90%] md:max-w-[75%] ml-0 mr-auto">
                        <GlassCard {...post} />
                        <div className="flex items-center justify-between w-full px-1">
                            <span className="text-[10px] text-gray-500 font-medium font-mono">
                                {post.timeAgo}
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleLike(post.id, post.likes_count)}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/50 border border-gray-200 hover:bg-red-50 transition-all group shadow-sm"
                                >
                                    <span className="text-sm group-hover:scale-110 transition-transform">❤️</span>
                                    <span className="text-[11px] font-bold text-gray-600">{post.likes_count || 0}</span>
                                </button>

                                <button
                                    onClick={() => handleThumbUp(post.id, post.thumbs_up_count)}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/50 border border-gray-200 hover:bg-green-50 transition-all group shadow-sm"
                                >
                                    <span className="text-sm group-hover:scale-110 transition-transform">👍</span>
                                    <span className="text-[11px] font-bold text-gray-600">{post.thumbs_up_count || 0}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <div ref={loadMoreRef} className="h-20 w-full flex items-center justify-center shrink-0">
                    {hasMore ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-[#00A884]" size={24} />
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Synchronizing...</span>
                        </div>
                    ) : posts.length > 0 ? (
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">End of Stream</span>
                    ) : null}
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-[#F0F2F5] p-2 md:p-3 px-3 md:px-4 flex items-end gap-2 md:gap-3 z-20 relative shrink-0 border-t border-gray-200">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />

                <div className="flex gap-1 pb-2 text-gray-500">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors relative"
                        disabled={isUploading}
                    >
                        <ImageIcon size={24} className={previewUrl ? "text-[#00A884]" : ""} />
                        {previewUrl && <div className="absolute top-1 right-1 w-2 h-2 bg-[#00A884] rounded-full border-2 border-[#F0F2F5]" />}
                    </button>
                </div>

                <div className="flex-1 bg-white rounded-2xl flex flex-col border border-white focus-within:border-gray-200 shadow-sm overflow-hidden mb-1 transition-all">
                    {previewUrl && (
                        <div className="p-2 bg-gray-50 border-b border-gray-100 relative group">
                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 relative">
                                {fileType === 'video' ? (
                                    <video src={previewUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={previewUrl} className="w-full h-full object-cover" />
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-[10px] text-white font-bold">{uploadProgress}%</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={clearAttachment}
                                className="absolute top-1 left-[84px] p-1 bg-white rounded-full shadow-md hover:bg-red-50 text-gray-500 hover:text-red-500 transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <textarea
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isUploading}
                        className="w-full p-2.5 px-4 text-sm resize-none focus:outline-none bg-transparent min-h-[44px] max-h-[120px] scrollbar-hide"
                        rows={1}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'inherit';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handlePost();
                            }
                        }}
                    />
                </div>

                <button
                    onClick={handlePost}
                    disabled={isUploading || (!text.trim() && !selectedFile)}
                    className={cn(
                        "mb-1 p-3 rounded-full transition-all shadow-md",
                        isUploading || (!text.trim() && !selectedFile)
                            ? "bg-gray-300 text-white cursor-not-allowed"
                            : "bg-[#00A884] hover:bg-[#008f6f] text-white active:scale-95"
                    )}
                >
                    {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                </button>
            </div>
        </div>
    );
}
