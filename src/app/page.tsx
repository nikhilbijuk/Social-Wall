"use client";

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import GlassCard from '@/components/ui/GlassCard';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import NameModal from '@/components/ui/NameModal';
import { EmojiBurst } from '@/components/ui/EmojiBurst';
import { TrendingCard } from '@/components/ui/TrendingCard';
import { LivePromptCta } from '@/components/ui/LivePromptCta';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { SinceYouWereAway } from '@/components/ui/SinceYouWereAway';
import { cn } from '@/lib/utils';

import { canPost, canView } from '@/lib/permissions';

export default function RootPage() {
  const { posts, setPosts, handleLike, handleThumbUp, isLoading, loadingProgress, hasMore, loadMorePosts, createPost,
    anonId, userProfile, setUserProfile, showNameModal, setShowNameModal, pendingPost, setPendingPost, level,
    typingUsers, sendTypingStatus } = useApp();
  const [text, setText] = useState('');
  const [tagSearchTerm, setTagSearchTerm] = useState<string | null>(null);
  const [tagUsers, setTagUsers] = useState<any[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Placeholder Logic
  const prompts = [
    "What are you enjoying right now?",
    "Drop your shoutout 🔥",
    "Who deserves applause today?",
    "Share the vibe 👀",
    "Best moment so far?",
    "Rate the vibe right now ✨"
  ];
  const [promptIndex, setPromptIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isFocused, prompts.length]);

  // Send typing status
  useEffect(() => {
    if (text.trim()) {
      sendTypingStatus(true);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000);
    } else {
      sendTypingStatus(false);
    }
  }, [text]);

  // Fetch Tags
  useEffect(() => {
    if (!tagSearchTerm) {
      setTagUsers([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/users/search?q=${tagSearchTerm}`)
        .then(res => res.json())
        .then(data => setTagUsers(Array.isArray(data) ? data : []));
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [tagSearchTerm]);

  // File States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const lastProgressRef = useRef<{ time: number, percent: number }>({ time: Date.now(), percent: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  const { startUpload } = useUploadThing("mediaUploader", {
    onUploadProgress: (p: number) => setUploadProgress(p),
    onUploadError: (e: any) => {
      alert(`Upload API Error: ${e.message}`);
    }
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    // HEIC Conversion Logic
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

    if (isHeic) {
      setUploadSpeed('Converting...');
      setIsUploading(true);
      try {
        const heic2any = (await import('heic2any')).default;
        const result = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8
        });
        const blob = Array.isArray(result) ? result[0] : result;
        file = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" });
      } catch (err) {
        console.error("HEIC conversion failed:", err);
        alert("Failed to process HEIC image. Please try another format.");
        setIsUploading(false);
        return;
      }
    }

    setSelectedFile(file);
    const mType = file.type.startsWith('video/') ? 'video' : 'image';
    setFileType(mType);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Start background upload immediately
    setIsUploading(true);
    try {
      const res = await startUpload([file]);
      if (res && res[0]) {
        setUploadedFileUrl(res[0].ufsUrl || res[0].url);
      } else {
        throw new Error("Media upload failed. Please check your connection or try a smaller file.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.message || "Failed to upload file. Please try again.");
      clearAttachment();
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadSpeed('');
    }
  };

  const clearAttachment = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileType(null);
    setUploadedFileUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadSpeed('');
  };

  const handlePost = async () => {
    if (!text.trim() && !uploadedFileUrl) return;

    // Optional: block if upload is still running
    if (isUploading) {
      alert("Please wait for the media to finish uploading.");
      return;
    }

    setIsUploading(true); // Re-use spinner for post submission

    try {
      await createPost({
        content: text,
        fileUrl: uploadedFileUrl || undefined,
        mediaType: uploadedFileUrl ? fileType : undefined,
      });

      setText('');
      clearAttachment();
    } catch (err: any) {
      console.error("Failed to post:", err);
      alert(err.message || "Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Infinite Scroll 
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Prevent loading history if we are still doing the initial layout/scroll down
        if (entries[0].isIntersecting && hasMore && !isLoading && !isInitialLoad.current) {
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

  // Robust scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  const isInitialLoad = useRef(true);
  const scrollPosRef = useRef<number>(0);
  const scrollHeightRef = useRef<number>(0);

  // Initial scroll to bottom when posts load (Removed aggressive loop to fix lag)
  useEffect(() => {
    if (posts.length > 0 && !isLoading && isInitialLoad.current) {
        // Just one clean timeout layout adjustment instead of interval spam
        const timeout = setTimeout(() => {
            scrollToBottom('auto');
            isInitialLoad.current = false;
        }, 150);

        return () => clearTimeout(timeout);
    }
  }, [posts.length, isLoading]);

  // Capture scroll state BEFORE history load
  useEffect(() => {
    if (isLoading && feedContainerRef.current) {
      scrollHeightRef.current = feedContainerRef.current.scrollHeight;
      scrollPosRef.current = feedContainerRef.current.scrollTop;
    }
  }, [isLoading]);

  // Adjust scroll AFTER history load to prevent jump
  useEffect(() => {
    if (!isLoading && !isInitialLoad.current && feedContainerRef.current && scrollHeightRef.current > 0) {
      const newScrollHeight = feedContainerRef.current.scrollHeight;
      const heightDiff = newScrollHeight - scrollHeightRef.current;

      // If we prepended items (height increased), adjust scrollTop to stay on the same item
      if (heightDiff > 0) {
        feedContainerRef.current.scrollTop = scrollPosRef.current + heightDiff;
      }

      // Reset markers
      scrollHeightRef.current = 0;
    }
  }, [isLoading, posts.length]);

  // Scroll to bottom ONLY on truly NEW messages (appended to end)
  const lastPostIdRef = useRef<string | null>(null);
  useEffect(() => {
    const lastPost = posts[posts.length - 1];
    if (lastPost && lastPost.id !== lastPostIdRef.current) {
      const isNewMessage = lastPostIdRef.current !== null;
      lastPostIdRef.current = lastPost.id;

      if (isNewMessage) {
        scrollToBottom('smooth');
      }
    }
  }, [posts]);

  const canUserPost = canPost(userProfile, level);
  const canUserView = canView(userProfile, level);

  if (!canUserView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#EFE7DD] text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 text-3xl">
          🔴
        </div>
        <h1 className="text-xl font-black uppercase tracking-tighter mb-2">Restricted Access</h1>
        <p className="text-sm text-black/60 max-w-xs">
          The wall is currently in <strong>Lockdown Mode</strong>. Only administrators can view or send messages.
        </p>
      </div>
    );
  }

  // Upload Speed Calculation
  useEffect(() => {
    if (uploadProgress === 0) {
      lastProgressRef.current = { time: Date.now(), percent: 0 };
    } else if (uploadProgress > 0 && uploadProgress < 100 && selectedFile) {
      const now = Date.now();
      const timeDiff = (now - lastProgressRef.current.time) / 1000;

      // Update speed at most every 500ms for stable display
      if (timeDiff >= 0.5) {
        const percentDiff = uploadProgress - lastProgressRef.current.percent;
        if (percentDiff > 0) {
          const totalSizeMB = selectedFile.size / (1024 * 1024);
          const mbDiff = (percentDiff / 100) * totalSizeMB;
          const speedMBps = mbDiff / timeDiff;

          setUploadSpeed(`${speedMBps.toFixed(1)} MB/s`);
        }
        lastProgressRef.current = { time: now, percent: uploadProgress };
      }
    } else if (uploadProgress === 100) {
      setUploadSpeed('Finishing...');
    }
  }, [uploadProgress, selectedFile]);

  // After name is claimed, auto-retry the pending post
  useEffect(() => {
    if (userProfile?.name && pendingPost) {
      createPost(pendingPost).then(() => {
        setText('');
        clearAttachment();
      }).finally(() => setPendingPost(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.name]);

  return (
    <div className="flex flex-col h-screen max-h-screen relative overflow-hidden">
      <LoadingOverlay isLoading={isLoading && posts.length === 0} progress={loadingProgress} />

      {/* Name Registration Modal */}
      {showNameModal && anonId && (
        <NameModal
          anonId={anonId}
          onSuccess={(user) => {
            setUserProfile(user);
            setShowNameModal(false);
          }}
        />
      )}

      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Feed Area */}
      <div
        ref={feedContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 custom-scrollbar flex flex-col"
      >
        {/* Load History at TOP */}
        <div ref={loadMoreRef} className="h-20 w-full flex items-center justify-center shrink-0">
          {hasMore ? (
            <div className="flex flex-col items-center gap-1.5 opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
              <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black">History Syncing...</span>
            </div>
          ) : posts.length > 0 ? (
            <span className="text-[9px] text-slate-300 uppercase tracking-[0.2em] font-black opacity-30">Beginning of Stream</span>
          ) : null}
        </div>

        {posts.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full opacity-20 select-none pointer-events-none">
            <h2 className="text-4xl font-black tracking-tighter uppercase grayscale">Wall_Is_Empty</h2>
          </div>
        )}

        {/* The Viral Stack: Since -> Pulse -> INPUT (High priority) -> Trending -> Spotlight */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6 w-full max-w-4xl mx-auto pt-2"
        >
            <SinceYouWereAway />
            <LivePromptCta />
            
            {/* Input Box Moved Here for Immediate Action */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl p-4 shadow-xl mb-2">
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/50 border border-white/20">
                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${userProfile?.name || 'Guest'}`} alt="" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00A884]">
                      Posting as {userProfile?.name || 'Guest'}
                    </span>
                    <span className="text-[9px] font-medium text-black/40">Shared inside class only</span>
                  </div>
                </div>

                <div className="flex items-end gap-2">
                    <div className="flex-1 bg-white/60 rounded-2xl flex flex-col border border-white/40 focus-within:border-[#00A884]/30 shadow-sm transition-all">
                        <textarea
                            placeholder={prompts[promptIndex]}
                            value={text}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => {
                                setText(e.target.value);
                                const match = e.target.value.match(/@([a-zA-Z0-9_]*)$/);
                                setTagSearchTerm(match ? match[1] : null);
                            }}
                            className="w-full p-3 px-4 text-sm bg-transparent resize-none focus:outline-none min-h-[44px] max-h-[120px] scrollbar-hide"
                            rows={1}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'inherit';
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                        />
                    </div>
                    <button
                        onClick={handlePost}
                        disabled={isSubmitting || (!text.trim() && !file)}
                        className={cn(
                            "h-11 px-6 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95",
                            !text.trim() && !file ? "bg-black/10 text-black/20" : "bg-[#00A884] text-white hover:scale-[1.02] shadow-[#00A884]/20"
                        )}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Post"}
                    </button>
                </div>
            </div>

            <TrendingCard />
            <SpotlightCard />
        </motion.div>

        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 mt-4 pb-20">
          {posts.map((post) => (
            <div key={post.id} className={cn(
              "flex flex-col gap-1 max-w-[90%] md:max-w-[85%]",
              userProfile?.id === post.user_id ? "ml-auto mr-0 items-end" : "ml-0 mr-auto items-start"
            )}>
              <div className="w-full flex flex-col items-inherit">
                <GlassCard {...post} authorId={post.user_id} />
                <div className={cn(
                  "flex items-center mt-1 px-1",
                  userProfile?.id === post.user_id ? "justify-end" : "justify-start"
                )}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLike(post.id, post.likes_count)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/70 border border-gray-200 hover:bg-red-50 transition-all group shadow-sm"
                    >
                      <span className="text-sm group-hover:scale-110 transition-transform">❤️</span>
                      <span className="text-[11px] font-bold text-gray-600">{post.likes_count || 0}</span>
                    </button>

                    <button
                      onClick={() => handleThumbUp(post.id, post.thumbs_up_count)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/70 border border-gray-200 hover:bg-green-50 transition-all group shadow-sm"
                    >
                      <span className="text-sm group-hover:scale-110 transition-transform">👍</span>
                      <span className="text-[11px] font-bold text-gray-600">{post.thumbs_up_count || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={messagesEndRef} className="h-2 w-full shrink-0" />
      </div>
      {canUserPost ? (
        <div className="z-20 relative">
          {typingUsers.length > 0 && (
            <div className="absolute -top-6 left-4 flex items-center gap-2">
              <div className="flex gap-0.5">
                <span className="w-1 h-1 bg-black/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-1 bg-black/20 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1 bg-black/20 rounded-full animate-bounce" />
              </div>
              <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
                {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.length} people are typing...`}
              </span>
            </div>
          )}
          <div className="bg-[#F0F2F5] p-2 md:p-3 px-3 md:px-4 flex items-end gap-2 md:gap-3 shrink-0 border-t border-gray-200">
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

            <div className="flex-1 bg-white rounded-2xl flex flex-col border border-white focus-within:border-gray-200 shadow-sm overflow-visible mb-1 transition-all relative">
              {tagUsers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col z-50">
                  <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-black/40">
                    Mention User
                  </div>
                  {tagUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        const newText = text.replace(/@[a-zA-Z0-9_]+$/, `@${u.name} `);
                        setText(newText);
                        setTagSearchTerm(null);
                        setTagUsers([]);
                      }}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${u.name}`} alt="" />
                      </div>
                      <span className="text-xs font-bold truncate text-gray-700">
                        {u.name} {u.is_verified && <span className="text-blue-500 text-[10px]">✔</span>}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {previewUrl && (
                <div className="p-2 bg-gray-50 border-b border-gray-100 relative group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 relative">
                    {fileType === 'video' ? (
                      <video src={previewUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-[2px]">
                        <span className="text-[11px] text-white font-black tracking-wider">{uploadProgress}%</span>
                        {uploadSpeed && <span className="text-[8px] text-white/80 font-bold uppercase tracking-widest mt-0.5">{uploadSpeed}</span>}
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
              
              {userProfile?.name && (
                <div className="px-4 py-1.5 flex items-center gap-1.5 opacity-50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">Posting as</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/80">{userProfile.name}</span>
                  {userProfile.is_verified ? (
                    <span className="text-blue-500 text-[9px]">✔</span>
                  ) : userProfile.is_trusted ? (
                    <span className="text-[8px] font-bold uppercase tracking-tight text-slate-500 px-1 bg-slate-100 rounded border border-slate-200">Connected</span>
                  ) : null}
                  <span className="mx-1.5 w-1 h-1 rounded-full bg-black/20" />
                  <span className="text-[10px] font-medium text-black/40">Visible to your class</span>
                </div>
              )}
 
              <textarea
                placeholder={prompts[promptIndex]}
                value={text}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => {
                  const newText = e.target.value;
                  setText(newText);
                  const match = newText.match(/@([a-zA-Z0-9_]*)$/);
                  setTagSearchTerm(match ? match[1] : null);
                }}
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
              disabled={isUploading || (!text.trim() && !uploadedFileUrl)}
              className={cn(
                "mb-1 p-3 rounded-full transition-all shadow-md active:scale-95",
                isUploading || (!text.trim() && !uploadedFileUrl)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-[#00A884] hover:bg-[#008f6f] text-white"
              )}
            >
              {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md p-4 text-center border-t border-gray-200 z-20 sticky bottom-0">
          <p className="text-xs font-bold text-black/40 uppercase tracking-widest">
            {level === 1 ? "🔐 Verified users only can post" :
              level === 2 ? "🟠 Admin broadcast mode active" :
                "🔴 lockdown mode active"}
          </p>
        </div>
      )}
    </div>
  );
}
