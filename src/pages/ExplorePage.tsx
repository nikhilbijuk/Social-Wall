import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/ui/GlassCard';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { Send, Image as ImageIcon, Video, X } from 'lucide-react';

export default function ExplorePage() {
  const { posts, addPost, handleLike, isLoading, loadingProgress } = useApp();
  const [text, setText] = useState('');

  // File States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Removed auto-scroll to bottom to keep newest posts visible at the top
  /*
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts]);
  */

  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size Validation (500KB for aggressive optimization)
    const MAX_SIZE = 500 * 1024; // 500KB

    if (file.size > MAX_SIZE) {
      alert("File too large! Please select a file under 500KB for better performance.");
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

  // Image Compression
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      try {
        console.log(`Starting compression for: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions for compression
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            URL.revokeObjectURL(img.src);
            if (blob) {
              console.log(`Compression complete: ${(blob.size / 1024).toFixed(2)}KB`);
              resolve(blob);
            } else {
              console.warn("Blob creation failed, using original file.");
              resolve(file);
            }
          }, 'image/jpeg', 0.5); // 50% quality JPEG
        };
        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          console.error("Image loading failed for compression. Possibly unsupported format.");
          resolve(file); // Fallback to original
        };
      } catch (err) {
        console.error("Compression error:", err);
        resolve(file);
      }
    });
  };

  // Convert File to Base64
  const convertToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Video Thumbnail Generation
  const captureVideoThumbnail = (file: File): Promise<Blob | null> => {
    return new Promise((resolve) => {
      console.log(`Generating thumbnail for: ${file.name}`);
      const video = document.createElement('video');
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        video.currentTime = 0.5; // Capture at 0.5 seconds
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400; // Small thumbnail
        canvas.height = (video.videoHeight / video.videoWidth) * canvas.width;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(videoUrl);
          if (blob) {
            console.log("Thumbnail generated successfully.");
            resolve(blob);
          } else {
            console.warn("Thumbnail blob creation failed.");
            resolve(null);
          }
        }, 'image/jpeg', 0.6);
      };

      video.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        console.error("Video thumbnail generation failed.");
        resolve(null);
      };
    });
  };

  const handlePost = async () => {
    if (!text.trim() && !selectedFile) return;
    setIsUploading(true);

    try {
      let finalImageUrl = undefined;
      let finalVideoUrl = undefined;

      if (selectedFile) {
        let fileToUpload: File | Blob = selectedFile;

        // Compress if it's an image
        if (fileType === 'image') {
          fileToUpload = await compressImage(selectedFile);
          const base64String = await convertToBase64(fileToUpload);
          finalImageUrl = base64String;
        } else if (fileType === 'video') {
          // Generate thumbnail for video
          const thumbnailBlob = await captureVideoThumbnail(selectedFile);
          if (thumbnailBlob) {
            finalImageUrl = await convertToBase64(thumbnailBlob);
          }

          const base64String = await convertToBase64(selectedFile);
          finalVideoUrl = base64String;
        }
      }

      console.log("Submitting post to AppContext...");

      await addPost({
        content: text,
        type: 'update',
        tag: 'Update',
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl
      });

      // Cleanup
      setText('');
      clearAttachment();

    } catch (error) {
      console.error("Failed to post:", error);
      alert("Failed to send post. Try a smaller file.");
    } finally {
      setIsUploading(false);
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
              <button
                onClick={() => handleLike(post.id, post.likes_count)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/50 border border-gray-200 hover:bg-red-50 transition-all group shadow-sm"
              >
                <span className="text-sm group-hover:scale-110 transition-transform">❤️</span>
                <span className="text-[11px] font-bold text-gray-600">
                  {post.likes_count || 0}
                </span>
              </button>
            </div>
          </div>
        ))}
        <div className="h-4 w-full shrink-0" /> {/* Bottom spacer for better scroll feeling */}
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
              <button onClick={clearAttachment} className="p-1 hover:bg-gray-200 rounded-full">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message"
            className="w-full bg-transparent p-3 pt-3 max-h-32 min-h-[48px] focus:outline-none resize-none text-black placeholder-gray-400 font-sans"
            rows={1}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handlePost}
          disabled={(!text.trim() && !selectedFile) || isUploading}
          className="mb-1 p-3 bg-[#00A884] hover:bg-[#008f6f] text-white rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={20} className="ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}