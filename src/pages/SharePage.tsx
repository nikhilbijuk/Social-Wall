import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Users, Pizza, HelpCircle, Info, Send, Heart, MessageSquare, Terminal, X, Paperclip } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SharePage() {
    const { addPost, currentUser, posts } = useApp();
    const [text, setText] = useState('');
    const [selectedTag, setSelectedTag] = useState('Update');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of feed when new post added
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [posts]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePost = () => {
        if (!text.trim() && !selectedImage) return;

        addPost({
            authorId: currentUser?.id || 'anon',
            authorName: currentUser?.name || 'Anonymous',
            content: text,
            type: 'update',
            tag: selectedTag,
            imageUrl: selectedImage || undefined
        });
        setText('');
        setSelectedImage(null);
    };

    const handleQuickPost = (type: 'update' | 'help' | 'food' | 'social', presetText: string, tag: string) => {
        addPost({
            authorId: currentUser?.id || 'anon',
            authorName: currentUser?.name || 'Anonymous',
            content: presetText,
            type: type,
            tag: tag
        });
    }

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">

            {/* LEFT COLUMN: COMMAND INPUT (Fixed on Desktop) */}
            <div className="md:w-1/3 flex flex-col gap-6">
                <header>
                    <div className="label-mono text-primary mb-1">Sector: Main_Lobby</div>
                    <h2 className="text-4xl font-black font-heading uppercase tracking-tighter leading-none">
                        Chats
                    </h2>
                </header>

                <GlassCard className="flex-1 flex flex-col p-6 min-h-[300px]">
                    <textarea
                        className="w-full flex-1 bg-transparent text-lg font-medium text-white placeholder:text-white/20 focus:outline-none resize-none font-mono"
                        placeholder="> Type your message here"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        autoFocus
                    />

                    {/* Image Preview */}
                    <AnimatePresence>
                        {selectedImage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="relative mb-4 group"
                            >
                                <img src={selectedImage} alt="Preview" className="w-full h-32 object-cover rounded border border-white/10" />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-4 space-y-4">
                        {/* Tags & Attachments Row */}
                        <div className="flex flex-wrap items-center gap-2 bg-black/20 p-2 rounded-lg">

                            <div className="flex gap-1">
                                {['Info', 'Doubts', 'Rank'].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        className={cn(
                                            "px-2 py-1.5 text-[9px] label-mono uppercase transition-all rounded",
                                            selectedTag === tag
                                                ? "bg-primary text-black font-bold"
                                                : "text-white/40 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            <div className="w-px h-6 bg-white/10 mx-1" />

                            <button
  onClick={() => fileInputRef.current?.click()}
  className={cn(
    "flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all group mt-2",
    selectedImage 
      ? "bg-primary/20 border-primary text-primary" 
      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/30"
  )}
  title="Attach Media"
>
  <Paperclip size={28} className={cn(selectedImage && "animate-bounce")} />
  <div className="text-left">
    <span className="block font-bold uppercase tracking-wider text-sm">
      {selectedImage ? "Media Attached" : "Attach Media"}
    </span>
    {!selectedImage && <span className="text-[10px] opacity-50">IMAGE_SIGNAL_01</span>}
  </div>
</button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>

                        <Button
                            variant="primary"
                            onClick={handlePost}
                            disabled={!text.trim() && !selectedImage}
                            className="w-full shadow-hard h-12"
                        >
                            SEND <Send size={16} className="ml-2" />
                        </Button>
                    </div>
                </GlassCard>

                {/* Macro Keys */}
                <div className="grid grid-cols-4 gap-2">
                    <MacroKey icon={<Users />} label="CAPACITY" onClick={() => handleQuickPost('update', 'Room Capacity Warning.', 'Capacity')} />
                    <MacroKey icon={<Pizza />} label="FOOD" onClick={() => handleQuickPost('food', 'Rations Available at Station.', 'Food')} />
                    <MacroKey icon={<HelpCircle />} label="SOS" onClick={() => handleQuickPost('help', 'Mentor requested at Node.', 'Help')} />
                    <MacroKey icon={<Info />} label="REPORT" onClick={() => handleQuickPost('update', 'Infrastructure issue reported.', 'Report')} />
                </div>
            </div>

            {/* RIGHT COLUMN: LIVE TERMINAL FEED */}
            <div className="md:w-2/3 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2 text-secondary animate-pulse">
                        <Terminal size={16} />
                        <span className="label-mono">LIVE_CHATS</span>
                    </div>
                    <div className="label-mono text-white/30">
                        {posts.length} SIGNALS
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-20"
                >
                    <AnimatePresence initial={false}>
                        {posts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg opacity-30">
                                <p className="label-mono">WAITING_FOR_SIGNAL...</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    layout
                                    className="group relative pl-4 border-l border-white/10 hover:border-primary transition-colors bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-r"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold font-mono text-primary text-sm">{post.authorName}</span>
                                            <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase">
                                                {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {post.tag && <Badge variant="outline" className="text-[9px] py-0 h-5 opacity-50">{post.tag}</Badge>}
                                    </div>

                                    <p className="mt-2 text-white/90 font-light text-sm leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </p>

                                    {post.imageUrl && (
                                        <div className="mt-3 mb-1">
                                            <img
                                                src={post.imageUrl}
                                                alt="Attachment"
                                                className="max-h-60 rounded border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-[10px] text-white/30 hover:text-white flex items-center gap-1">
                                            <Heart size={10} /> LIKE
                                        </button>
                                        <button className="text-[10px] text-white/30 hover:text-white flex items-center gap-1">
                                            <MessageSquare size={10} /> REPLY
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function MacroKey({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center bg-white/5 border border-white/5 hover:bg-primary hover:text-black hover:border-primary transition-all p-3 rounded group h-20"
        >
            <div className="group-hover:scale-110 transition-transform mb-1 opacity-70 group-hover:opacity-100">{icon}</div>
            <span className="text-[7px] font-mono font-bold uppercase tracking-widest">{label}</span>
        </button>
    )
}
