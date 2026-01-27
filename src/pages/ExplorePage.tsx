//import React from 'react';
import { useApp } from '../context/AppContext';
// This is the specific line to fix:
import GlassCard from '../components/ui/GlassCard'; 

export default function ExplorePage() {
  const { posts, handleLike } = useApp();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white mb-8 italic tracking-tighter">
        HACK_HUB // SYSTEM_FEED
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-col gap-2">
            <GlassCard {...post} />
            
            <div className="flex items-center justify-between px-2">
              <button 
                onClick={() => handleLike(post.id, post.likes_count)}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-pink-500/20 transition-all"
              >
                <span>❤️</span>
                <span className="text-white text-sm font-mono">
                  {post.likes_count || 0}
                </span>
              </button>
              
              <span className="text-[10px] text-white/30 font-mono">
                {new Date(post.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}