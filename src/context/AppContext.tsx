"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createPostAction } from '@/app/actions/posts';

import { UserProfile } from '@/lib/permissions';

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
    anonId: string | null;
    userProfile: UserProfile | null;
    setUserProfile: (profile: UserProfile) => void;
    showNameModal: boolean;
    setShowNameModal: (v: boolean) => void;
    pendingPost: any | null;
    setPendingPost: (data: any | null) => void;
    level: number;
    fetchSettings: () => Promise<void>;
    generateSyncCode: () => Promise<string>;
    claimSyncCode: (code: string) => Promise<boolean>;
    showVerificationModal: boolean;
    setShowVerificationModal: (v: boolean) => void;
    typingUsers: string[];
    sendTypingStatus: (isTyping: boolean) => void;
    burstTrigger: { type: string, count: number } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [leaderboard, setLeaderboard] = useState<any>(null);
    const [anonId, setAnonId] = useState<string | null>(null);
    const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
    const [showNameModal, setShowNameModal] = useState(false);
    const [pendingPost, setPendingPost] = useState<any | null>(null);
    const [level, setLevel] = useState(0);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [burstTrigger, setBurstTrigger] = useState<{ type: string, count: number } | null>(null);

    // Initialize anonymous ID and user profile from localStorage/API
    useEffect(() => {
        let id = localStorage.getItem('anonId');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('anonId', id);
        }
        setAnonId(id);

        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                setUserProfileState(JSON.parse(savedProfile));
            } catch (e) {
                console.error("Failed to parse saved profile", e);
            }
        }

        // Verify with server on load
        fetch(`/api/register?anonId=${id}`).then(res => res.json()).then(data => {
            if (data.registered && data.user) {
                setUserProfile(data.user);
            }
        });

        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (typeof data.level === 'number') {
                setLevel(data.level);
            }
        } catch (err) {
            console.error("Settings fetch error:", err);
        }
    };

    const setUserProfile = (profile: UserProfile) => {
        setUserProfileState(profile);
        localStorage.setItem('userProfile', JSON.stringify(profile));
    };

    const fetchPosts = useCallback(async (options?: { before?: number; after?: number }) => {
        setIsLoading(true);
        setLoadingProgress(30);
        try {
            let url = `/api/posts?limit=10`;
            if (options?.before) url += `&before=${options.before}`;
            if (options?.after) url += `&after=${options.after}`;

            const res = await fetch(url);
            const data = await res.json();

            setLoadingProgress(80);
            if (Array.isArray(data)) {
                if (options?.before) {
                    // Prepend old messages
                    setPosts(prev => [...data, ...prev]);
                    setHasMore(data.length === 10);
                } else if (options?.after) {
                    // Append new messages
                    setPosts(prev => [...prev, ...data]);
                } else {
                    // Initial load
                    setPosts(data);
                    setHasMore(data.length === 10);
                }
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setIsLoading(false);
            setLoadingProgress(100);
        }
    }, []);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await fetch('/api/leaderboard');
            const data = await res.json();
            if (Array.isArray(data)) {
                setLeaderboard(data);
            }
        } catch (err) {
            console.error("Leaderboard error:", err);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
        fetchLeaderboard();

        // Setup real-time SSE stream for new posts
        const eventSource = new EventSource('/api/stream');

        eventSource.addEventListener('typing', (event) => {
            try {
                const names = JSON.parse(event.data);
                if (Array.isArray(names)) {
                    // Filter out current user's name
                    const otherTyping = names.filter(n => n !== userProfile?.name);
                    setTypingUsers(otherTyping);
                }
            } catch (err) {
                console.error("SSE Typing Error:", err);
            }
        });

        eventSource.addEventListener('reaction', (event) => {
            try {
                const reactions = JSON.parse(event.data);
                if (Array.isArray(reactions) && reactions.length > 0) {
                    const latest = reactions[reactions.length - 1];
                    setBurstTrigger({ type: latest.type, count: reactions.length });

                    // Reset trigger after a bit
                    setTimeout(() => setBurstTrigger(null), 500);

                    // Update local post counts if they are visible
                    setPosts(prev => prev.map(p => {
                        const count = reactions.filter((r: any) => r.post_id === p.id).length;
                        if (count > 0) {
                            return {
                                ...p,
                                likes_count: (latest.type === 'like' ? (p.likes_count || 0) + count : p.likes_count),
                                thumbs_up_count: (latest.type === 'thumb' ? (p.thumbs_up_count || 0) + count : p.thumbs_up_count),
                                is_viral: (p.likes_count || 0) + (p.thumbs_up_count || 0) + count >= 10 // Simple viral check
                            };
                        }
                        return p;
                    }));
                }
            } catch (err) {
                console.error("SSE Reaction Error:", err);
            }
        });

        eventSource.onmessage = (event) => {
            try {
                const newPosts = JSON.parse(event.data);
                if (Array.isArray(newPosts) && newPosts.length > 0) {
                    setPosts(prev => {
                        // Filter out duplicates (just in case)
                        const existingIds = new Set(prev.map(p => p.id));
                        const filteredNew = newPosts.filter(p => !existingIds.has(p.id));
                        if (filteredNew.length === 0) return prev;

                        // Append new messages to the end
                        return [...prev, ...filteredNew];
                    });
                }
            } catch (err) {
                console.error("SSE Parse Error:", err);
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE Connection Error:", err);
            eventSource.close();
            // Optional: retry logic could go here
        };

        const interval = setInterval(fetchLeaderboard, 30000); // Update leaderboard every 30s

        return () => {
            eventSource.close();
            clearInterval(interval);
        };
    }, [fetchLeaderboard, userProfile?.name]);

    const sendTypingStatus = async (isTyping: boolean) => {
        if (!userProfile?.name || !anonId) return;
        try {
            await fetch('/api/typing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: anonId, name: userProfile.name, isTyping })
            });
        } catch (err) {
            console.error("Failed to send typing status", err);
        }
    };

    const loadMorePosts = () => {
        if (posts.length > 0 && hasMore && !isLoading) {
            fetchPosts({ before: posts[0].timestamp });
        }
    };

    // After identity is claimed/synced, auto-retry the pending post
    useEffect(() => {
        if (userProfile?.name && pendingPost) {
            createPost(pendingPost).finally(() => setPendingPost(null));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile?.name]);

    const createPost = async (data: any) => {
        if (!userProfile) {
            // Save the post data and show name modal
            setPendingPost(data);
            setShowNameModal(true);
            return;
        }
        const res = await createPostAction({ ...data, userId: anonId || 'anonymous' });
        fetchPosts();
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

    const generateSyncCode = async () => {
        if (!userProfile?.id) return '';
        const res = await fetch('/api/sync/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userProfile.id })
        });
        const data = await res.json();
        return data.code || '';
    };

    const claimSyncCode = async (code: string) => {
        const res = await fetch('/api/sync/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const data = await res.json();
        if (data.user) {
            setUserProfile(data.user);
            localStorage.setItem('anonId', data.user.id);
            // Reload to sync all state correctly
            window.location.reload();
            return true;
        }
        return false;
    };

    return (
        <AppContext.Provider value={{
            posts, isLoading, loadingProgress, hasMore, loadMorePosts,
            createPost, handleLike, handleThumbUp, leaderboard,
            anonId, userProfile, setUserProfile, showNameModal, setShowNameModal,
            pendingPost, setPendingPost, level, fetchSettings,
            generateSyncCode, claimSyncCode,
            showVerificationModal, setShowVerificationModal,
            typingUsers, sendTypingStatus,
            burstTrigger
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
