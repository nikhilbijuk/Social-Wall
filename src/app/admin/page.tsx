"use client";

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { redirect } from 'next/navigation';
import { Shield, Users, MessageSquare, Settings, CheckCircle2, AlertTriangle, EyeOff, Check, X, ExternalLink, UserCheck, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Cookies from 'js-cookie';

import { auth } from "@/auth";

export default async function AdminPage() {
    const session = await auth();
    
    // Server-side safety: Hard whitelist
    const ADMIN_EMAILS = [
        "nikhilbijuk@gmail.com", // Main Admin
        "user56@example.com"    // Dev/Testing
    ];

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
        redirect("/");
    }

    return <AdminClient />;
}

function AdminClient() {
    const { userProfile, level, fetchSettings, posts, setPosts } = useApp();
    const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'posts' | 'requests'>('settings');
    const [adminSecret, setAdminSecret] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [livePromptInput, setLivePromptInput] = useState('');
    const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);

    // Auth state modifications
    const [isAdminState, setIsAdminState] = useState(false);
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        // Check if cookie exists or user is admin via DB
        const hasAdminCookie = Cookies.get('admin') === 'true';
        if (hasAdminCookie || userProfile?.is_admin === 1) {
            setIsAdminState(true);
        } else if (userProfile !== null && userProfile?.is_admin === 0) {
            // Not admin and no cookie
            setIsAdminState(false);
        }
        setIsCheckingAdmin(false);
    }, [userProfile]);

    useEffect(() => {
        if (isAdminState) {
            if (activeTab === 'requests') fetchVerifications();
            else if (activeTab === 'users') fetchUsers();
            else if (activeTab === 'settings') fetchCurrentPrompt();
        }
    }, [activeTab, isAdminState]);

    const handleUnlockAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError('');
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ secret: adminSecret })
            });

            const data = await res.json();
            if (data.success) {
                Cookies.set('admin', 'true', { path: '/' });
                setIsAdminState(true);
            } else {
                setLoginError(data.error || "Incorrect secret");
            }
        } catch (err) {
            setLoginError("Failed to connect to server");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const fetchCurrentPrompt = async () => {
        try {
            const res = await fetch('/api/live-prompt');
            const data = await res.json();
            if (data.prompt) {
                setCurrentPrompt(data.prompt);
                setLivePromptInput(data.prompt);
            } else {
                setCurrentPrompt(null);
                setLivePromptInput('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePushPrompt = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch('/api/live-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: livePromptInput, userId: userProfile?.id })
            });
            if (res.ok) {
                await fetchCurrentPrompt();
                alert("Live Prompt updated across all active clients!");
            } else {
                alert("Failed to update prompt. Ensure you have admin rights.");
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const fetchVerifications = async () => {
        // Now backend can just trust cookie or use secret as fallback, but we'll still pass it if needed
        const res = await fetch(`/api/admin/verifications${adminSecret ? `?adminSecret=${adminSecret}` : ''}`);
        if (res.ok) {
            const data = await res.json();
            setVerificationRequests(data);
        }
    };

    const fetchUsers = async () => {
        const res = await fetch(`/api/admin/users${adminSecret ? `?adminSecret=${adminSecret}` : ''}`);
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
    };

    const handleVerifyAction = async (requestId: string, userId: string, action: 'approve' | 'deny') => {
        const res = await fetch('/api/admin/verifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, userId, action, adminSecret })
        });
        if (res.ok) {
            fetchVerifications();
            if (activeTab === 'users') fetchUsers();
        }
    };

    const updateLevel = async (newLevel: number) => {
        setIsUpdating(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level: newLevel, adminSecret })
            });
            if (res.ok) {
                await fetchSettings();
            } else {
                alert("Failed to update level. Check secret.");
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const togglePostModeration = async (postId: string, field: 'is_deepfake' | 'is_blur', value: number) => {
        // Optimistic UI Update
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, [field]: value } : p));

        try {
            await fetch(`/api/admin/moderate-post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, field, value, adminSecret })
            });
        } catch (e) {
            console.error(e);
            // Revert on error
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, [field]: value === 1 ? 0 : 1 } : p));
        }
    };

    if (isCheckingAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#EFE7DD] p-10 text-center">
                <Loader2 className="animate-spin text-black/20 mb-4" size={40} />
                <h2 className="text-sm font-black uppercase tracking-widest opacity-20">Verifying Credentials...</h2>
            </div>
        );
    }

    if (!isAdminState) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#EFE7DD] p-6 text-center">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl">
                    <Lock size={32} />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Restricted Area</h1>
                <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-8">Platform Moderation Hub</p>

                <form onSubmit={handleUnlockAdmin} className="w-full max-w-sm flex flex-col gap-4">
                    <input
                        type="password"
                        placeholder="Enter Admin Secret"
                        value={adminSecret}
                        onChange={(e) => setAdminSecret(e.target.value)}
                        className="w-full px-4 py-3 text-center text-sm font-bold tracking-widest bg-white rounded-xl border-2 border-transparent focus:border-black outline-none transition-all shadow-sm disabled:opacity-50"
                        disabled={isLoggingIn}
                    />
                    {loginError && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{loginError}</p>}
                    <button
                        type="submit"
                        disabled={isLoggingIn || !adminSecret}
                        className={cn(
                            "w-full py-3 rounded-xl font-black uppercase tracking-widest transition-all",
                            isLoggingIn || !adminSecret ? "bg-black/10 text-black/40" : "bg-black text-white hover:scale-[1.02] shadow-xl"
                        )}
                    >
                        {isLoggingIn ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Unlock"}
                    </button>
                    <button type="button" onClick={() => redirect("/")} className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-4 hover:text-black">Return Home</button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-[#EFE7DD]">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter">Command Center</h1>
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Platform Moderation Hub</p>
                    </div>
                </div>
            </div>

            {/* Sidebar/Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'settings', label: 'Systems', icon: Settings },
                    { id: 'requests', label: 'Verifications', icon: CheckCircle2 },
                    { id: 'posts', label: 'Content Control', icon: MessageSquare },
                    { id: 'users', label: 'Accounts', icon: Users },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === tab.id ? "bg-black text-white" : "bg-white/50 text-black/40 hover:bg-white"
                        )}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Areas */}
            <div className="bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden">
                {activeTab === 'settings' && (
                    <div className="p-6 space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest">Live Prompt Control</h2>
                                    <p className="text-[10px] uppercase font-bold text-black/40 tracking-widest">Inject a conversation starter to everyone instantly</p>
                                </div>
                                {currentPrompt ? (
                                    <span className="text-[10px] font-black uppercase bg-[#00A884]/10 text-[#00A884] px-2 py-1 rounded tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-pulse" /> Active</span>
                                ) : (
                                    <span className="text-[10px] font-black uppercase bg-black/5 text-black/40 px-2 py-1 rounded tracking-widest">Inactive</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 relative overflow-hidden">
                                <textarea 
                                    value={livePromptInput}
                                    onChange={(e) => setLivePromptInput(e.target.value)}
                                    placeholder="e.g. Which event are you heading to next?"
                                    className="w-full bg-white px-4 py-3 rounded-lg border border-amber-200 focus:border-amber-400 outline-none text-sm font-bold text-amber-900 placeholder:text-amber-300 resize-none z-10"
                                    rows={2}
                                />
                                <div className="flex items-center gap-2 z-10">
                                    <button 
                                        onClick={handlePushPrompt}
                                        disabled={isUpdating}
                                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex-1 shadow-sm"
                                    >
                                        Push to Wall
                                    </button>
                                    <button 
                                        onClick={() => { setLivePromptInput(''); setTimeout(() => document.getElementById('push-prompt-btn')?.click(), 100); }}
                                        disabled={isUpdating || !currentPrompt}
                                        className="bg-white hover:bg-red-50 text-red-500 border border-red-100 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors"
                                    >
                                        Clear
                                    </button>
                                    <button id="push-prompt-btn" className="hidden" onClick={handlePushPrompt}></button>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest mb-4">Platform Access Level</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { lv: 0, label: "Green - Open", desc: "Anyone can view & post (Default Classroom)", color: "bg-green-500", border: "border-green-100" },
                                    { lv: 1, label: "Yellow - Verified Only", desc: "Anyone can view, only verified accounts can post", color: "bg-blue-500", border: "border-blue-100" },
                                    { lv: 2, label: "Orange - Broadcast", desc: "Anyone can view, only admin can post", color: "bg-orange-500", border: "border-orange-100" },
                                    { lv: 3, label: "Red - Lockdown", desc: "Only admins can view or post (Emergency)", color: "bg-red-500", border: "border-red-100" },
                                ].map((item) => (
                                    <button
                                        key={item.lv}
                                        onClick={() => {
                                            if (confirm(`Change wall mode to ${item.label}? This affects all active classmates.`)) {
                                                updateLevel(item.lv);
                                            }
                                        }}
                                        disabled={isUpdating}
                                        className={cn(
                                            "flex flex-col p-4 rounded-xl border-2 transition-all text-left group",
                                            level === item.lv ? `border-black bg-black text-white shadow-lg` : `border-transparent bg-gray-50 hover:bg-white`
                                        )}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={cn("w-2 h-2 rounded-full", item.color)} />
                                            <span className="font-black uppercase text-[11px] tracking-widest">{item.label}</span>
                                        </div>
                                        <p className={cn("text-[10px] font-medium opacity-60")}>{item.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="p-6">
                        <h2 className="text-sm font-black uppercase tracking-widest mb-4">Pending Verifications</h2>
                        {!adminSecret && <p className="text-xs text-black/20 font-bold uppercase italic italic-none">Enter admin secret to refresh</p>}
                        <div className="grid grid-cols-1 gap-4">
                            {verificationRequests.length === 0 && <p className="text-xs text-black/20 font-bold uppercase py-10 text-center">No pending requests</p>}
                            {verificationRequests.map((req) => (
                                <div key={req.id} className="p-4 bg-gray-50 rounded-2xl border border-black/5 flex flex-col sm:flex-row gap-4">
                                    <div className="w-full sm:w-32 h-32 bg-gray-200 rounded-xl overflow-hidden shadow-inner shrink-0 cursor-pointer group" onClick={() => window.open(req.id_card_url, '_blank')}>
                                        <img src={req.id_card_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="ID Card" />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink size={14} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-black text-sm uppercase tracking-tighter">{req.userName}</h3>
                                            <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">User ID: {req.user_id}</p>
                                        </div>
                                        <div className="flex gap-2 mt-4 sm:mt-0">
                                            <button
                                                onClick={() => handleVerifyAction(req.id, req.user_id, 'approve')}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#00A884] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-[#008f6f] transition-all"
                                            >
                                                <Check size={14} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleVerifyAction(req.id, req.user_id, 'deny')}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-red-600 transition-all"
                                            >
                                                <X size={14} /> Deny
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className="p-6">
                        <h2 className="text-sm font-black uppercase tracking-widest mb-4">Content Control</h2>
                        <div className="space-y-3">
                            {[...posts].reverse().slice(0, 50).map((post) => (
                                <div key={post.id} className="p-3 bg-gray-50 rounded-xl border border-black/5 flex items-center justify-between gap-4 transition-all hover:bg-white hover:shadow-sm">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] text-black/40 font-bold uppercase truncate">
                                                {post.authorName || 'Guest'}
                                                {post.authorName && <span className="normal-case opacity-50 ml-1">(@{String(post.authorName).replace(/\s+/g, '_')})</span>}
                                            </p>
                                            {post.media_type && <span className="text-[8px] bg-gray-800 text-white px-1.5 rounded uppercase font-black">{post.media_type}</span>}
                                        </div>
                                        <p className="text-xs line-clamp-1 opacity-70 italic-none">{post.content || 'Media Content'}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => togglePostModeration(post.id, 'is_deepfake', post.is_deepfake ? 0 : 1)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border text-[10px] font-black uppercase tracking-widest",
                                                post.is_deepfake ? "bg-red-500 text-white border-red-600 shadow-md scale-105" : "bg-white border-black/10 text-black/40 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                            )}
                                            title="Mark as Deepfake"
                                        >
                                            <AlertTriangle size={14} /> {post.is_deepfake ? "Deepfake" : "Flag AI"}
                                        </button>
                                        <button
                                            onClick={() => togglePostModeration(post.id, 'is_blur', post.is_blur ? 0 : 1)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border text-[10px] font-black uppercase tracking-widest",
                                                post.is_blur ? "bg-orange-500 text-white border-orange-600 shadow-md scale-105" : "bg-white border-black/10 text-black/40 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200"
                                            )}
                                            title="Blur Content"
                                        >
                                            <EyeOff size={14} /> {post.is_blur ? "Blurred" : "Blur"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="p-6">
                        <h2 className="text-sm font-black uppercase tracking-widest mb-4">User Directory</h2>
                        <div className="space-y-2">
                            {users.map((user) => (
                                <div key={user.id} className="p-3 bg-gray-50 rounded-xl border border-black/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-black/5 shrink-0">
                                            <img
                                                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-tighter">@{user.name}</span>
                                            <div className="flex gap-2 mt-0.5">
                                                {user.is_verified ? <span className="text-[8px] text-blue-500 font-bold uppercase tracking-widest">Verified</span> : null}
                                                {user.is_admin ? <span className="text-[8px] text-red-500 font-bold uppercase tracking-widest">Admin</span> : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className={cn(
                                                "p-1.5 rounded-lg transition-colors border",
                                                user.is_admin ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-black/10 text-black/20"
                                            )}
                                            title={user.is_admin ? "Remove Admin" : "Make Admin"}
                                            onClick={async () => {
                                                if (!adminSecret) return alert("Secret required");
                                                const res = await fetch(`/api/admin/users/${user.id}/admin`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ adminSecret, isAdmin: !user.is_admin })
                                                });
                                                if (res.ok) fetchUsers();
                                            }}
                                        >
                                            <Shield size={14} />
                                        </button>
                                        {!user.is_verified && (
                                            <button
                                                className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                                                title="Manually Verify"
                                                onClick={() => handleVerifyAction('manual', user.id, 'approve')}
                                            >
                                                <UserCheck size={14} />
                                            </button>
                                        )}
                                        <button
                                            className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-black hover:text-white transition-all border border-black/5"
                                            title="Copy User ID"
                                            onClick={() => navigator.clipboard.writeText(user.id)}
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
