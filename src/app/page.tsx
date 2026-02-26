"use client";

import { useState, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, Globe, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function Home() {
  const router = useRouter();
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
      className="min-h-screen w-full bg-[#E5DDD5] relative overflow-hidden flex flex-col items-center justify-center selection:bg-[#00A884]/30 selection:text-black cursor-crosshair"
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-[#E5DDD5] flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl font-black tracking-tighter text-[#111B21]">
                SOCIAL WALL
              </span>
            </div>
            <div className="w-64 h-1 bg-black/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#00A884]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-black/40 uppercase tracking-widest">
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
            
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-grid-black/[0.02] bg-[length:50px_50px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

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
                <span className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-black/10 bg-white/50 text-[10px] uppercase tracking-widest text-black/60 backdrop-blur-sm shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-pulse" />
                  System Online v2.0
                </span>
              </motion.div>

              {/* Massive Kinetic Typography */}
              <h1 className="relative font-black text-5xl md:text-9xl lg:text-[11rem] leading-[0.85] tracking-tighter text-[#111B21] mb-8 uppercase flex flex-col items-center w-full break-words">
                <span>Real-Time</span>
                <div className="flex items-center gap-4 md:gap-8 my-2 md:my-0">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 100 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="h-1 md:h-3 bg-black/10 hidden md:block"
                  />
                  <span className="italic text-black/30 lowercase tracking-normal text-3xl md:text-7xl font-serif">coordination</span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 100 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="h-1 md:h-3 bg-black/10 hidden md:block"
                  />
                </div>
                Infrastructure
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="text-lg md:text-xl text-black/40 max-w-2xl font-mono text-[13px] tracking-widest uppercase mb-16"
              >
                The synchronized nervous system for <br className="hidden md:block" /> next-gen hackathons.
              </motion.p>

              {/* CTA Area */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="flex flex-col md:flex-row items-center gap-8"
              >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00A884] to-[#34B7F1] rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-200" />
                  <Button
                    size="lg"
                    className="relative min-w-[240px] h-16 bg-[#111B21] text-white border border-white/20 hover:border-[#00A884] text-sm tracking-widest uppercase"
                    onClick={() => router.push('/dashboard/explore')}
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

                <button onClick={() => router.push('/docs')} className="font-mono text-[10px] text-black/30 hover:text-[#00A884] transition-colors flex items-center gap-2 group cursor-pointer border-none bg-transparent uppercase tracking-widest">
                  <div className="w-2 h-2 border border-black/20 group-hover:border-[#00A884] transition-colors" />
                  Read_Documentation
                </button>
              </motion.div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
