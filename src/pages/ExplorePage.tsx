import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/ui/GlassCard';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { Send, Image as ImageIcon, Video, X, Loader2 } from 'lucide-react';
import { useUploadThing } from '../components/UploadButton';

export default function ExplorePage() {
  const { posts, addPost, handleLike, handleThumbUp, isLoading, loadingProgress, hasMore, loadMorePosts } = useApp();
  const [text, setText] = useState('');

  // File States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Infinite Scroll Ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // UploadThing Hook
  const { startUpload } = useUploadThing(fileType === 'video' ? "videoUploader" : "imageUploader", {
    onUploadProgress: (p) => {
      setUploadProgress(p);
    }
  });

  // Infinite Scroll Observer
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


  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size Validation - Matching server limits roughly (client side check)
    // Server: 4MB Image, 16MB Video
    const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
    const MAX_VIDEO_SIZE = 16 * 1024 * 1024;

    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    const sizeLabel = type === 'image' ? '4MB' : '16MB';

    if (file.size > maxSize) {
      alert(`File too large! Please select a ${type} under ${sizeLabel}.`);
      return;
    }

    setSelectedFile(file);
    setFileType(type);

    // Create Preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const clearAttachment = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileType(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!text.trim() && !selectedFile) return;

    if (isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let finalFileUrl = undefined;
      let finalMediaType: 'image' | 'video' | undefined = undefined;

      if (selectedFile) {
        // Start UploadThing Upload
        console.log("Starting upload...");
        const res = await startUpload([selectedFile]);

        if (!res || res.length === 0) {
          throw new Error("Upload failed");
        }

        finalFileUrl = res[0].url;
        finalMediaType = fileType || undefined;
        console.log("Upload successful:", finalFileUrl);
      }

      await addPost({
        content: text,
        type: 'update',
        tag: 'Update',
        fileUrl: finalFileUrl,
        mediaType: finalMediaType
      });

      // Cleanup
      setText('');
      clearAttachment();

    } catch (error) {
      console.error("Failed to post:", error);
      alert("Failed to send post. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#EFE7DD] relative">
      <LoadingOverlay isLoading={isLoading} progress={loadingProgress} />
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-col gap-1 max-w-[85%] md:max-w-[70%] ml-0 mr-auto">
            <GlassCard {...post} />
            <div className="flex items-center justify-between w-full px-1">
              <span className="text-[10px] text-gray-500 font-medium">
                {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLike(post.id, post.likes_count)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/50 border border-gray-200 hover:bg-red-50 transition-all group shadow-sm"
                >
                  <span className="text-sm group-hover:scale-110 transition-transform">❤️</span>
                  <span className="text-[11px] font-bold text-gray-600">
                    {post.likes_count || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleThumbUp(post.id, post.thumbs_up_count)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/50 border border-gray-200 hover:bg-green-50 transition-all group shadow-sm"
                >
                  <span className="text-sm group-hover:scale-110 transition-transform">👍</span>
                  <span className="text-[11px] font-bold text-gray-600">
                    {post.thumbs_up_count || 0}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Infinite Scroll Loader */}
        <div ref={loadMoreRef} className="h-8 w-full flex items-center justify-center shrink-0">
          {hasMore ? (
            <Loader2 className="animate-spin text-gray-400" size={20} />
          ) : (
            <span className="text-xs text-gray-400">No more posts</span>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-[#F0F2F5] p-2 md:p-3 px-3 md:px-4 flex items-end gap-2 md:gap-3 z-20 relative shrink-0">
        {/* Hidden Inputs */}
        <input
          type="file"
          ref={imageInputRef}
          onChange={(e) => handleFileSelect(e, 'image')}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={videoInputRef}
          onChange={(e) => handleFileSelect(e, 'video')}
          accept="video/*"
          className="hidden"
        />

        {/* Attachment Buttons */}
        <div className="flex gap-1 pb-3 text-gray-500">
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={!!selectedFile}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={selectedFile ? "Only one file allowed" : "Attach Image"}
          >
            <ImageIcon size={24} />
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={!!selectedFile}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={selectedFile ? "Only one file allowed" : "Attach Video"}
          >
            <Video size={24} />
          </button>
        </div>

        {/* Input Box */}
        <div className="flex-1 bg-white rounded-2xl flex flex-col border border-white focus-within:border-white shadow-sm overflow-hidden">
          {/* Thread Preview */}
          {previewUrl && (
            <div className="p-2 bg-gray-50 border-b border-gray-100 flex justify-between items-start">
              {fileType === 'image' ? (
                <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded-md object-cover border border-gray-200" />
              ) : (
                <video src={previewUrl} className="h-20 w-auto rounded-md object-cover border border-gray-200" />
              )}
              <div className="flex flex-col gap-1 items-end">
                <button onClick={clearAttachment} className="p-1 hover:bg-gray-200 rounded-full">
                  <X size={16} className="text-gray-500" />
                </button>
                {isUploading && (
                  <div className="text-[10px] text-green-600 font-medium">
                    Uploading... {uploadProgress}%
                  </div>
                )}
              </div>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePost();
              }
            }}
            disabled={isUploading}
            placeholder={isUploading ? "Processing..." : "Type a message"}
            className="w-full bg-transparent p-3 pt-3 max-h-32 min-h-[48px] focus:outline-none resize-none text-black placeholder-gray-400 font-sans disabled:opacity-50"
            rows={1}
          />
          {/* Progress Bar Line */}
          {isUploading && (
            <div className="w-full h-1 bg-gray-100">
              <div
                className="h-full bg-[#00A884] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handlePost}
          disabled={(!text.trim() && !selectedFile) || isUploading}
          className="mb-1 p-3 bg-[#00A884] hover:bg-[#008f6f] text-white rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[48px]"
          title={isUploading ? "Processing..." : "Send"}
        >
          {isUploading ? (
            <Loader2 size={20} className="animate-spin text-white" />
          ) : (
            <Send size={20} className="ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}