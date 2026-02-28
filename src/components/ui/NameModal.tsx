"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface NameModalProps {
    onSuccess: (name: string) => void;
    anonId: string;
}

export default function NameModal({ onSuccess, anonId }: NameModalProps) {
    const [name, setName] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Focus the input when the modal mounts
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = name.trim();

        if (!trimmed || trimmed.length < 2) {
            setErrorMsg("Name must be at least 2 characters.");
            setStatus('error');
            return;
        }

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ anonId, name: trimmed }),
            });
            const data = await res.json();

            if (!res.ok || data.error) {
                setErrorMsg(data.error || "Something went wrong.");
                setStatus('error');
            } else {
                setStatus('success');
                localStorage.setItem('userName', data.name);
                setTimeout(() => onSuccess(data.name), 600);
            }
        } catch {
            setErrorMsg("Network error. Please try again.");
            setStatus('error');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
                    initial={{ y: 60, opacity: 0, scale: 0.96 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 60, opacity: 0, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-br from-[#00A884] to-[#007a62] p-6 text-white text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User size={24} className="text-white" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight">Choose Your Name</h2>
                        <p className="text-[12px] text-white/70 mt-1">This name will be yours forever on the wall.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <input
                                ref={inputRef}
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (status === 'error') { setStatus('idle'); setErrorMsg(''); }
                                }}
                                placeholder="e.g. Nikhil, TeamLead..."
                                maxLength={24}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00A884] focus:outline-none focus:ring-2 focus:ring-[#00A884]/20 font-semibold text-gray-800 placeholder:font-normal placeholder:text-gray-400 text-sm transition-all"
                            />
                            <div className="flex items-center justify-between px-1">
                                <AnimatePresence>
                                    {status === 'error' && (
                                        <motion.p
                                            className="text-[11px] text-red-500 flex items-center gap-1 font-semibold"
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <AlertCircle size={10} />
                                            {errorMsg}
                                        </motion.p>
                                    )}
                                    {status === 'success' && (
                                        <motion.p
                                            className="text-[11px] text-green-600 flex items-center gap-1 font-semibold"
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <CheckCircle2 size={10} />
                                            Name reserved!
                                        </motion.p>
                                    )}
                                    {status === 'idle' && <span />}
                                </AnimatePresence>
                                <span className="text-[10px] text-gray-400">{name.length}/24</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success' || name.trim().length < 2}
                            className="w-full py-3 rounded-xl bg-[#00A884] hover:bg-[#008f6f] disabled:bg-gray-200 disabled:text-gray-400 text-white font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                        >
                            {status === 'loading' ? (
                                <><Loader2 size={16} className="animate-spin" /> Reserving...</>
                            ) : status === 'success' ? (
                                <><CheckCircle2 size={16} /> All Set!</>
                            ) : (
                                'Claim My Name →'
                            )}
                        </button>

                        <p className="text-center text-[10px] text-gray-400 leading-relaxed">
                            Your name is permanent & unique. No password or email needed.
                        </p>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
