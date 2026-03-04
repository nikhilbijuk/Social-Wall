"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { useApp } from '@/context/AppContext';

export default function VerificationModal() {
    const { userProfile, setShowVerificationModal } = useApp();
    const [status, setStatus] = useState<'idle' | 'uploading' | 'submitting' | 'success' | 'error'>('idle');
    const [idCardUrl, setIdCardUrl] = useState<string | null>(null);

    const { startUpload } = useUploadThing("mediaUploader", {
        onUploadProgress: (p) => console.log('ID Upload:', p),
        onUploadError: (e) => {
            alert("Upload failed: " + e.message);
            setStatus('error');
        }
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus('uploading');
        try {
            const res = await startUpload([file]);
            if (res?.[0]) {
                setIdCardUrl(res[0].ufsUrl || res[0].url);
                setStatus('idle');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    const handleSubmit = async () => {
        if (!userProfile?.id || !idCardUrl) return;

        setStatus('submitting');
        try {
            const res = await fetch('/api/verification/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userProfile.id, idCardUrl })
            });
            if (res.ok) {
                setStatus('success');
                setTimeout(() => setShowVerificationModal(false), 2000);
            } else {
                const data = await res.json();
                alert(data.error || "Submission failed");
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <button
                        onClick={() => setShowVerificationModal(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-6">
                        <div className="w-12 h-12 bg-[#00A884]/10 rounded-full flex items-center justify-center text-[#00A884] mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tighter mb-1">Get Verified</h2>
                        <p className="text-xs text-black/40 font-bold uppercase tracking-widest mb-6">Verified users skip moderation</p>

                        {status === 'success' ? (
                            <div className="py-8 text-center space-y-3">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="font-bold text-green-700 underline underline-offset-4 decoration-green-200">Application Submitted!</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic italic-none">Admins will review your ID shortly.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#00A884]">1. Upload ID Image</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 transition-all hover:border-[#00A884]/30 bg-gray-50 flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            disabled={status === 'uploading'}
                                        />
                                        {idCardUrl ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-lg flex items-center justify-center border border-green-100">
                                                    <Upload size={20} />
                                                </div>
                                                <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter">ID Loaded successfully</span>
                                            </div>
                                        ) : status === 'uploading' ? (
                                            <Loader2 size={24} className="text-[#00A884] animate-spin" />
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-300 group-hover:text-[#00A884] transition-colors mb-2" />
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Click to upload photo of ID Card</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!idCardUrl || status !== 'idle'}
                                    className="w-full py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 disabled:opacity-20 transition-all flex items-center justify-center gap-2"
                                >
                                    {status === 'submitting' ? (
                                        <><Loader2 size={16} className="animate-spin" /> Processing...</>
                                    ) : (
                                        'Submit Application →'
                                    )}
                                </button>

                                <p className="text-[9px] text-gray-400 text-center uppercase font-bold tracking-widest leading-relaxed px-4">
                                    Your ID is used only for verification and is deleted from our cache after approval.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
