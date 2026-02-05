import { useState, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Globe, Users, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import Button from '../components/ui/Button';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Mouse Spotlight Effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const maskImage = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

    // Fake Preloader
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            onMouseMove={handleMouseMove}
            className="min-h-screen w-full bg-background relative overflow-hidden flex flex-col items-center justify-center selection:bg-primary selection:text-black cursor-crosshair"
        >
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-6xl font-black font-heading tracking-tighter text-white">
                                SOCIAL WALL
                            </span>
                        </div>
                        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] label-mono text-white/40">
                            <Loader2 size={12} className="animate-spin" />
                            INITIALIZING SYSTEM PROTOCOLS...
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="contents"
                    >
                        {/* Film Grain Overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-20" style={{ backgroundImage: 'url("/noise.png")', backgroundSize: '100px 100px' }} />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none z-20"></div>

                        {/* Ambient Background */}
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none" />
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* Spotlight Overlay */}
                        <motion.div
                            className="absolute inset-0 z-0 bg-white/[0.03] pointer-events-none"
                            style={{ maskImage, WebkitMaskImage: maskImage }}
                        />

                        <main className="relative z-10 flex flex-col items-center text-center max-w-6xl px-6">

                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="mb-8"
                            >
                                <span className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest text-white/60 backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#DFFF00]" />
                                    System Online v2.0
                                </span>
                            </motion.div>

                            {/* Massive Kinetic Typography */}
                            <h1 className="relative font-heading font-black text-5xl md:text-9xl lg:text-[11rem] leading-[0.85] tracking-tighter text-white mb-8 uppercase flex flex-col items-center mix-blend-difference w-full break-words">
                                <SplitText>Real-Time</SplitText>
                                <div className="flex items-center gap-4 md:gap-8 my-2 md:my-0">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: 100 }}
                                        transition={{ delay: 0.8, duration: 1 }}
                                        className="h-1 md:h-3 bg-white/20 hidden md:block"
                                    />
                                    <span className="font-serif italic text-white/30 lowercase tracking-normal text-3xl md:text-7xl">coordination</span>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: 100 }}
                                        transition={{ delay: 0.8, duration: 1 }}
                                        className="h-1 md:h-3 bg-white/20 hidden md:block"
                                    />
                                </div>
                                <div className="max-w-full overflow-hidden text-center md:text-left">
                                    <GlitchText>Infrastructure</GlitchText>
                                </div>
                            </h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.8 }}
                                className="text-lg md:text-xl text-white/40 max-w-2xl font-mono text-[13px] tracking-widest uppercase mb-16"
                            >
                                The synchronized nervous system for <br className="hidden md:block" /> next-gen hackathons.
                            </motion.p>

                            {/* Magnetic CTA Area */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1 }}
                                className="flex flex-col md:flex-row items-center gap-8"
                            >
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-200 animate-tilt" />
                                    <Button
                                        size="lg"
                                        className="relative min-w-[240px] h-16 bg-black text-white border border-white/20 hover:border-primary text-sm tracking-widest uppercase"
                                        onClick={() => navigate('/join')}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        <span className="relative z-10 flex items-center justify-between w-full px-4">
                                            Initialize_Wall
                                            <motion.span
                                                animate={{ x: isHovered ? 4 : 0 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                className="bg-white text-black rounded-full p-1"
                                            >
                                                <ArrowRight size={14} />
                                            </motion.span>
                                        </span>
                                    </Button>
                                </div>

                                <button onClick={() => navigate('/docs')} className="label-mono text-[10px] text-white/30 hover:text-primary transition-colors flex items-center gap-2 group cursor-pointer border-none bg-transparent">
                                    <div className="w-2 h-2 border border-white/20 group-hover:border-primary transition-colors" />
                                    Read_Documentation
                                </button>
                            </motion.div>

                            {/* Floating Features */}
                            <div className="absolute -z-10 w-full h-full inset-0 pointer-events-none">
                                <FloatingIcon icon={<Zap />} top="15%" left="10%" delay={0} />
                                <FloatingIcon icon={<Globe />} top="25%" right="15%" delay={1} />
                                <FloatingIcon icon={<Users />} bottom="20%" left="20%" delay={2} />
                                <FloatingIcon icon={<div className="w-24 h-24 border border-dashed border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />} bottom="-10%" right="-5%" delay={0} />
                            </div>
                        </main>

                        {/* Footer Stats */}
                        <motion.footer
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="absolute bottom-8 w-full px-12 flex justify-between items-end text-white/20 select-none pointer-events-none font-mono text-[10px]"
                        >
                            <div className="text-left">
                                <span className="block text-primary/50 mb-1">NODE_LOC</span>
                                127.0.0.1
                            </div>

                            <div className="flex gap-12">
                                <div>
                                    <span className="block text-white/10 mb-1">LATENCY</span>
                                    34ms
                                </div>
                                <div className="text-right">
                                    <span className="block text-white/10 mb-1">STATUS</span>
                                    SECURE
                                </div>
                            </div>
                        </motion.footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper for Staggered Text Reveal
function SplitText({ children, className, delay = 0 }: { children: string, className?: string, delay?: number }) {
    return (
        <span className={cn("inline-block overflow-hidden", className)}>
            <motion.span
                initial={{ y: "120%" }}
                animate={{ y: 0 }}
                transition={{
                    duration: 1,
                    ease: [0.16, 1, 0.3, 1],
                    delay: delay
                }}
                className="inline-block"
            >
                {children}
            </motion.span>
        </span>
    );
}

// Glitch Text Component
function GlitchText({ children }: { children: string }) {
    return (
        <span className="relative inline-block group">
            <span className="relative z-10">{children}</span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-[2px] group-hover:skew-x-12 transition-all duration-100 select-none">
                {children}
            </span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-secondary opacity-0 group-hover:opacity-100 group-hover:-translate-x-[2px] group-hover:-skew-x-12 transition-all duration-100 select-none">
                {children}
            </span>
        </span>
    )
}

function FloatingIcon({ icon, top, left, right, bottom, delay }: any) {
    return (
        <motion.div
            className="absolute text-white/5 mix-blend-screen"
            style={{ top, left, right, bottom }}
            animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
        >
            <div className="scale-150 blur-[1px]">
                {icon}
            </div>
        </motion.div>
    )
}
