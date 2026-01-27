import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Paperclip, X } from 'lucide-react'; // Removed unused 'Image' import

const SharePage = () => {
  const { addPost } = useApp();
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!text.trim() && !imageFile) return;
    setIsUploading(true);
    try {
      await addPost({
        content: text,
        type: 'update',
        tag: 'Update',
      }, imageFile || undefined);
      setText('');
      setSelectedImage(null);
      setImageFile(null);
    } catch (error) {
      console.error("Failed to post:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-[#121212] border border-white/10 rounded-lg p-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message here"
          className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:outline-none resize-none min-h-[150px] text-lg"
        />
        {selectedImage && (
          <div className="relative mt-4 inline-block">
            <img src={selectedImage} alt="Preview" className="max-h-64 rounded-lg border border-white/10" />
            <button onClick={() => { setSelectedImage(null); setImageFile(null); }} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><X size={16} /></button>
          </div>
        )}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-[#D4FF00]" disabled={isUploading}><Paperclip size={24} /></button>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
          <button
            onClick={handlePost}
            disabled={(!text.trim() && !imageFile) || isUploading}
            className="bg-[#D4FF00] text-black px-8 py-2 rounded-md font-bold flex items-center gap-2"
          >
            {isUploading ? 'SENDING...' : 'SEND'}
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePage;