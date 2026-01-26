import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { Send, Paperclip } from 'lucide-react';

export default function SharePage() {
  const { addPost, currentUser, posts } = useApp();
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (!text.trim()) return;
    addPost({
      authorId: currentUser?.id || 'anon',
      authorName: currentUser?.name || 'Anonymous',
      content: text,
      type: 'update',
      tag: 'Update'
    });
    setText('');
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
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white/40 hover:text-primary">
              <Paperclip size={20} />
            </button>
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
            <GlassCard key={post.id} className="p-4">
              <span className="label-mono text-primary text-[10px]">{post.authorName}</span>
              <p className="text-white/80 mt-1">{post.content}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}