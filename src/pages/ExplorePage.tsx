import GlassCard from '../components/ui/GlassCard';
import { useApp } from '../context/AppContext'; // 1. Import the data hook
import { MapPin, Clock } from 'lucide-react';

export default function ExplorePage() {
  const { posts } = useApp(); // 2. Get the live posts from Supabase

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h2 className="text-4xl font-black font-heading uppercase tracking-tighter leading-none text-white">
          Active Feed
        </h2>
        <p className="text-white/40 font-mono mt-2">Real-time updates from the hub.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {posts.length === 0 ? (
          <p className="text-white/20 font-mono text-center py-10">No active updates found.</p>
        ) : (
          posts.map((post) => (
            <GlassCard key={post.id} className="p-0 border-white/5 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#D4FF00]/10 rounded text-[#D4FF00]">
                      <MapPin size={18} />
                    </div>
                    <span className="text-[#D4FF00] font-bold text-xs uppercase tracking-widest">
                      {post.tag || 'Update'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-white/30 text-xs">
                    <Clock size={14} />
                    <span>{new Date(post.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <p className="text-white text-lg leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* 3. Display the Image if it exists */}
                {post.imageUrl && (
                  <div className="mt-4 rounded-lg border border-white/10 overflow-hidden">
                    <img 
                      src={post.imageUrl} 
                      alt="Post visual" 
                      className="w-full h-auto max-h-[500px] object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}