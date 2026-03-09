"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import GlassCard from '@/components/ui/GlassCard';
import { Loader2, Image as ImageIcon, Tag as TagIcon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
    const searchParams = useSearchParams();
    const tag = searchParams.get('tag');
    const id = searchParams.get('id');
    const { handleLike, handleThumbUp, userProfile: currentUserProfile } = useApp();

    const [userProfile, setUserProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [taggedPosts, setTaggedPosts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'posts' | 'tagged'>('posts');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                // Fetch User Details
                const userRes = await fetch(`/api/users/details?${tag ? `tag=${tag}` : `id=${id}`}`);
                if (!userRes.ok) throw new Error("User not found");
                const userData = await userRes.json();
                setUserProfile(userData);

                // Fetch User's Posts
                // Make sure to pass the actual ID to the posts endpoint, not the tag,
                // because the API route `api/posts/user/route.ts` expects `id`
                const postsRes = await fetch(`/api/posts/user?id=${userData.id}`);
                const postsData = await postsRes.json();
                setPosts(Array.isArray(postsData) ? postsData : []);

                // Fetch Tagged Posts
                const taggedRes = await fetch(`/api/posts/tagged?tag=${userData.tag}`);
                const taggedData = await taggedRes.json();
                setTaggedPosts(Array.isArray(taggedData) ? taggedData : []);
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (tag || id) {
            fetchProfileData();
        }
    }, [tag, id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
                <Loader2 className="animate-spin text-black/20 mb-4" size={40} />
                <h2 className="text-sm font-black uppercase tracking-widest opacity-20">Loading Profile...</h2>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">User Not Found</h1>
                <Link href="/" className="text-sm font-bold text-[#00A884] uppercase tracking-widest flex items-center gap-2 mt-4 hover:underline">
                    <ArrowLeft size={16} /> Return Home
                </Link>
            </div>
        );
    }

    const displayPosts = activeTab === 'posts' ? posts : taggedPosts;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-[#EFE7DD]">
            {/* Header / Intro */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 bg-white/50 rounded-full hover:bg-white transition-all shadow-sm">
                    <ArrowLeft size={20} className="text-black/60" />
                </Link>
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white shadow-xl flex-shrink-0">
                    <img
                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${userProfile.name}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                        {userProfile.name}
                        {userProfile.is_verified && <span className="text-blue-500 text-lg" title="Verified">✔</span>}
                    </h1>
                    <p className="text-xs font-bold text-black/40 uppercase tracking-widest">
                        @{userProfile.tag}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-black/5 pb-2">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                        activeTab === 'posts' ? "bg-black text-white shadow-md" : "bg-white/50 text-black/40 hover:bg-white"
                    )}
                >
                    <ImageIcon size={16} /> Posts ({posts.length})
                </button>
                <button
                    onClick={() => setActiveTab('tagged')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                        activeTab === 'tagged' ? "bg-black text-white shadow-md" : "bg-white/50 text-black/40 hover:bg-white"
                    )}
                >
                    <TagIcon size={16} /> Tagged ({taggedPosts.length})
                </button>
            </div>

            {/* Feed */}
            <div className="flex flex-col gap-4">
                {displayPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white/50 rounded-2xl border border-black/5 opacity-50">
                        <h2 className="text-xl font-black tracking-tighter uppercase grayscale">No_Content_Found</h2>
                    </div>
                ) : (
                    displayPosts.map((post) => (
                        <div key={post.id} className="flex flex-col gap-1 w-full max-w-full">
                            <GlassCard {...post} authorId={post.user_id} />
                            <div className="flex items-center justify-start mt-1 px-1">
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
                    ))
                )}
            </div>
        </div>
    );
}
