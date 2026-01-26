import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { Send, Paperclip, X } from 'lucide-react';

export default function SharePage() {
  const { addPost, posts } = useApp();
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!text.trim() && !selectedImage) return;
    addPost({
      content: text,
      type: 'update',
      tag: 'Update',
      imageUrl: selectedImage || undefined 
    });
    setText('');
    setSelectedImage(null);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col md:flex-row gap-6">
      <div className="md:w-1/3 flex flex-col gap-6">
        <header>
          <h2 className="text-4xl font-black uppercase text-white">Posts</h2>
        </header>
        <GlassCard className="flex flex-col p-6 h-[400px]">
          <textarea
            className="w-full flex-1 bg-transparent text-white placeholder:text-white/20 focus:outline-none resize-none font-mono"
            placeholder="> Type your message here"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {selectedImage && (
            <div className="relative mb-4">
              <img src={selectedImage} alt="Preview" className="w-full h-32 object-cover rounded border border-white/10" />
              <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white/40 hover:text-primary transition-colors">
                <Paperclip size={20} />
              </button>
            </div>
            <Button onClick={handlePost} className="gap-2">
              <span>SEND</span>
              <Send size={16} />
            </Button>
          </div>
        </GlassCard>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="label-mono text-white/20 mb-4 flex justify-between">
          <span>Active_Feed</span>
          <span>{posts?.length || 0} Chats</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4">
          {posts?.map((post) => (
            <GlassCard key={post.id} className="p-4 border-white/5">
              <p className="text-white/80 mt-1">{post.content}</p>
              {post.imageUrl && (
                <div className="mt-3 rounded overflow-hidden border border-white/10">
                  <img src={post.imageUrl} className="w-full h-auto object-cover" alt="Shared" />
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}