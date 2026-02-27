"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createPostAction } from '@/app/actions/posts';

interface AppContextType {
    posts: any[];
    isLoading: boolean;
    loadingProgress: number;
    hasMore: boolean;
    loadMorePosts: () => void;
    createPost: (data: any) => Promise<any>;
    handleLike: (postId: string, currentLikes: number) => Promise<void>;
    handleThumbUp: (postId: string, currentThumbs: number) => Promise<void>;
    leaderboard: any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [leaderboard, setLeaderboard] = useState<any>(null);

    const fetchPosts = useCallback(async (before?: number) => {
        setIsLoading(true);
        setLoadingProgress(30);
        try {
            const url = `/api/posts?limit=10${before ? `&before=${before}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();

            setLoadingProgress(80);
            if (Array.isArray(data)) {
                if (before) {
                    setPosts(prev => [...prev, ...data]);
                } else {
                    setPosts(data);
                }
                setHasMore(data.length === 10);
            } else {
                console.error("API returned non-array data:", data);
                if (!before) setPosts([]);
                setHasMore(false);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            if (!before) setPosts([]);
        } finally {
            setIsLoading(false);
            setLoadingProgress(100);
        }
    }, []);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await fetch('/api/leaderboard');
            const data = await res.json();
            if (data && !data.error) {
                setLeaderboard(data);
            }
        } catch (err) {
            console.error("Leaderboard error:", err);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 30000); // Update leaderboard every 30s
        return () => clearInterval(interval);
    }, [fetchPosts, fetchLeaderboard]);

    const loadMorePosts = () => {
        if (posts.length > 0 && hasMore && !isLoading) {
            fetchPosts(posts[posts.length - 1].timestamp);
        }
    };

    const createPost = async (data: any) => {
        // In a real app, we'd get the userId from the session
        const res = await createPostAction({ ...data, userId: 'anonymous' });
        fetchPosts(); // Refresh feed
        return res;
    };

    const handleLike = async (postId: string, currentLikes: number) => {
        // Optimistic UI update
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));

        try {
            await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
            fetchLeaderboard(); // Update stats
        } catch (err) {
            console.error("Like error:", err);
            // Rollback if needed
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: currentLikes } : p));
        }
    };

    const handleThumbUp = async (postId: string, currentThumbs: number) => {
        // Optimistic UI update
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, thumbs_up_count: (p.thumbs_up_count || 0) + 1 } : p));

        try {
            await fetch(`/api/posts/${postId}/thumb`, { method: 'POST' });
            fetchLeaderboard();
        } catch (err) {
            console.error("Thumb error:", err);
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, thumbs_up_count: currentThumbs } : p));
        }
    };

    return (
        <AppContext.Provider value={{
            posts, isLoading, loadingProgress, hasMore, loadMorePosts,
            createPost, handleLike, handleThumbUp, leaderboard
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
};
