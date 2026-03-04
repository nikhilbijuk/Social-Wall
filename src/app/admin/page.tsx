"use client";

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { redirect } from 'next/navigation';
import { Shield, Users, MessageSquare, Settings, CheckCircle2, AlertTriangle, EyeOff, Check, X, ExternalLink, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPage() {
    const { userProfile, level, fetchSettings, posts } = useApp();
    const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'posts' | 'requests'>('settings');
    const [adminSecret, setAdminSecret] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    // Initial check for is_admin
    useEffect(() => {
        if (userProfile && !userProfile.is_admin) {
            redirect("/");
        }
    }, [userProfile]);

    useEffect(() => {
        if (activeTab === 'requests' && adminSecret) {
            fetchVerifications();
        } else if (activeTab === 'users' && adminSecret) {
            fetchUsers();
        }
    }, [activeTab, adminSecret]);

    const fetchVerifications = async () => {
        const res = await fetch(`/api/admin/verifications?adminSecret=${adminSecret}`);
        if (res.ok) {
            const data = await res.json();
            setVerificationRequests(data);
        }
    };

    const fetchUsers = async () => {
        const res = await fetch(`/api/admin/users?adminSecret=${adminSecret}`);
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
        if (!adminSecret) {
            alert("Please enter the Admin Secret first.");
            return;
        }
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
        if (!adminSecret) return alert("Secret required");

        try {
            const res = await fetch(`/api/admin/moderate-post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, field, value, adminSecret })
            });
            if (res.ok) { window.location.reload(); }
        } catch (e) {
            console.error(e);
        }
    };

    if (!userProfile?.is_admin) {
        return <div className="p-20 text-center font-black uppercase opacity-20">Unauthorized Access</div>;
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

                <div className="flex gap-2">
                    <input
                        type="password"
                        placeholder="Admin Secret Key"
                        value={adminSecret}
                        onChange={(e) => setAdminSecret(e.target.value)}
                        className="px-3 py-2 text-xs rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
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
                                        onClick={() => updateLevel(item.lv)}
                                        disabled={isUpdating}
                                        className={cn(
                                            "flex flex-col p-4 rounded-xl border-2 transition-all text-left group",
                                            level === item.lv ? `border-black bg-black text-white` : `border-transparent bg-gray-50 hover:bg-white`
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
                            {posts.slice(0, 30).map((post) => (
                                <div key={post.id} className="p-3 bg-gray-50 rounded-xl border border-black/5 flex items-center justify-between gap-4 transition-all hover:bg-white hover:shadow-sm">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] text-black/40 font-bold uppercase truncate">{post.authorName || 'Guest'}</p>
                                            {post.media_type && <span className="text-[8px] bg-gray-800 text-white px-1.5 rounded uppercase font-black">{post.media_type}</span>}
                                        </div>
                                        <p className="text-xs line-clamp-1 opacity-70 italic-none">{post.content || 'Media Content'}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => togglePostModeration(post.id, 'is_deepfake', post.is_deepfake ? 0 : 1)}
                                            className={cn(
                                                "p-2 rounded-lg transition-colors border",
                                                post.is_deepfake ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-black/10 text-black/20"
                                            )}
                                            title="Mark as Deepfake"
                                        >
                                            <AlertTriangle size={14} />
                                        </button>
                                        <button
                                            onClick={() => togglePostModeration(post.id, 'is_blur', post.is_blur ? 0 : 1)}
                                            className={cn(
                                                "p-2 rounded-lg transition-colors border",
                                                post.is_blur ? "bg-orange-50 border-orange-200 text-orange-500" : "bg-white border-black/10 text-black/20"
                                            )}
                                            title="Blur Content"
                                        >
                                            <EyeOff size={14} />
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
                                        <div className={cn("w-2 h-2 rounded-full", user.is_verified ? "bg-blue-500" : "bg-gray-300")} />
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-tighter">{user.name}</span>
                                            <div className="flex gap-2">
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
