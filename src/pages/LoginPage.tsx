import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/ui/Button';
import { User, Mail, Users, ArrowRight, Fingerprint, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function LoginPage() {
    const { login } = useApp();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        team: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate biometric scan
        setTimeout(async () => {
            await login(formData.email, formData.team);
            navigate('/dashboard/explore');
        }, 1500);
    };

    return (
        <AuthLayout>
            <div className="text-center mb-8 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-16 h-16 bg-white/5 rounded border border-white/10 mx-auto mb-6 flex items-center justify-center relative overflow-hidden"
                >
                    <Fingerprint className="text-white/40" size={32} />
                    <motion.div
                        animate={{ top: ['100%', '-100%'] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-primary/50 shadow-[0_0_15px_#DFFF00]"
                    />
                </motion.div>

                <h2 className="text-3xl font-bold font-heading uppercase tracking-tight">Identity Verification</h2>
                <p className="text-white/40 mt-2 label-mono text-xs">Establish connection to the grid</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <KineticInput
                        label="FULL_NAME"
                        icon={<User size={16} />}
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                        isFocused={focusedField === 'name'}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Ex. Alex Cipher"
                    />
                    <KineticInput
                        label="EMAIL_ADDRESS"
                        type="email"
                        icon={<Mail size={16} />}
                        value={formData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                        isFocused={focusedField === 'email'}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="alex@social-wall.io"
                    />
                    <KineticInput
                        label="Affiliation / Team"
                        icon={<Users size={16} />}
                        value={formData.team}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, team: e.target.value })}
                        isFocused={focusedField === 'team'}
                        onFocus={() => setFocusedField('team')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Ex. Syntax Error"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 uppercase tracking-widest font-bold text-sm overflow-hidden relative"
                    size="lg"
                    disabled={isLoading}
                >
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.span
                                key="scanning"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex items-center gap-3 text-primary"
                            >
                                <ScanLine className="animate-pulse" size={16} /> VERIFYING_IDENTITY...
                            </motion.span>
                        ) : (
                            <motion.span
                                key="default"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="flex items-center gap-3"
                            >
                                Confirm Identity <ArrowRight size={16} />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </form>
        </AuthLayout>
    );
}

function KineticInput({ label, icon, isFocused, ...props }: any) {
    return (
        <div className="relative group">
            {/* Label */}
            <label className={cn(
                "absolute -top-2.5 left-3 px-1 bg-surface text-[10px] label-mono font-bold transition-colors z-10 uppercase",
                isFocused ? "text-primary" : "text-white/30"
            )}>
                {label}
            </label>

            {/* Input Container */}
            <div className={cn(
                "relative bg-black/40 border transition-all duration-300 flex items-center h-12 rounded overflow-hidden",
                isFocused ? "border-primary/50 shadow-[0_0_15px_rgba(223,255,0,0.05)]" : "border-white/10 group-hover:border-white/20"
            )}>
                {/* Icon Area */}
                <div className={cn(
                    "w-10 h-full flex items-center justify-center border-r transition-colors",
                    isFocused ? "border-primary/20 text-primary" : "border-white/5 text-white/20"
                )}>
                    {icon}
                </div>

                <input
                    className="flex-1 bg-transparent border-none outline-none px-4 text-white placeholder:text-white/10 font-mono text-sm h-full"
                    {...props}
                />
            </div>

            {/* Corner Markers */}
            {isFocused && (
                <>
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-primary pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-primary pointer-events-none" />
                </>
            )}
        </div>
    )
}
