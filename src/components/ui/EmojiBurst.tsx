"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";

interface Emoji {
    id: number;
    emoji: string;
    x: number;
}

export function EmojiBurst() {
    const { burstTrigger } = useApp();
    const [emojis, setEmojis] = useState<Emoji[]>([]);

    const spawn = useCallback((type: string) => {
        const emojiList = type === 'like' ? ["❤️", "💖", "✨", "🥰"] : ["👍", "🔥", "🚀", "👏"];
        const newEmojis: Emoji[] = [];

        // Spawn a burst of emojis
        for (let i = 0; i < 20; i++) {
            newEmojis.push({
                id: Date.now() + Math.random(),
                emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
                x: Math.random() * 80 + 10
            });
        }
        setEmojis(prev => [...prev, ...newEmojis]);

        // Cleanup after 3s
        setTimeout(() => {
            setEmojis(prev => prev.filter(e => !newEmojis.includes(e)));
        }, 3000);
    }, []);

    useEffect(() => {
        if (burstTrigger) {
            spawn(burstTrigger.type);
        }
    }, [burstTrigger, spawn]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {emojis.map((e) => (
                    <motion.div
                        key={e.id}
                        initial={{ y: "110vh", x: `${e.x}vw`, opacity: 1, scale: 0.5 }}
                        animate={{
                            y: "-20vh",
                            x: `${e.x + (Math.random() * 30 - 15)}vw`,
                            opacity: 0,
                            scale: Math.random() * 1.5 + 1.5,
                            rotate: Math.random() * 720 - 360
                        }}
                        transition={{ duration: 2.5 + Math.random() * 1.5, ease: "easeOut" }}
                        className="absolute text-4xl select-none filter drop-shadow-lg"
                    >
                        {e.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
