import { useRef } from 'react';
import { useApp } from '../context/AppContext';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '../lib/utils';
import { ArrowRight, Rss } from 'lucide-react';

export default function ExplorePage() {
    const { facilityStatuses, updateFacilityStatus } = useApp();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    const editorialFeed = [
        { id: 1, title: 'The Final Sprint Begins', category: 'EVENT_LOG', img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1200', desc: "Teams are entering the final 12 hours. Energy levels are critical." },
        { id: 2, title: 'Midnight Pizza Drop', category: 'SUPPLY_CHAIN', img: 'https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80&w=1200', desc: "Rations have arrived at Sector 4. Refuel immediately." },
        { id: 3, title: 'Network Congestion', category: 'INFRASTRUCTURE', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200', desc: "High bandwidth usage detected in the VR zones. Rerouting traffic." },
    ];

    return (
        <div className="max-w-4xl mx-auto min-h-screen pb-24" ref={containerRef}>

            {/* STICKY STATUS TICKER */}
            <div className="sticky top-0 z-30 -mx-6 md:-mx-12 px-6 md:px-12 py-4 bg-background/80 backdrop-blur-md border-b border-white/5 mb-12 shadow-2xl">
                <div className="flex overflow-x-auto gap-8 items-center scrollbar-hide">
                    <div className="flex items-center gap-2 text-primary whitespace-nowrap">
                        <Rss size={16} className="animate-pulse" />
                        <span className="label-mono font-bold text-xs">LIVE_FEED_ONLINE</span>
                    </div>
                    <div className="w-px h-4 bg-white/10 shrink-0" />

                    {facilityStatuses.map(status => (
                        <button
                            key={status.id}
                            onClick={() => updateFacilityStatus(status.id, status.status === 'available' ? 'empty' : 'available')}
                            className="flex items-center gap-2 whitespace-nowrap group shrink-0"
                        >
                            <span className={cn("text-xs font-bold uppercase", status.status === 'available' ? 'text-white' : 'text-white/40 group-hover:text-white')}>
                                {status.name}
                            </span>
                            <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", status.status === 'available' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500')} />
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN HEADER */}
            <header className="mb-24 text-center">
                <div className="label-mono text-primary mb-4">Transmission_Source: Central</div>
                <h1 className="text-display font-black uppercase tracking-tighter leading-[0.8]">
                    The<br />Stream
                </h1>
            </header>

            {/* VERTICAL STREAM */}
            <div className="space-y-24">
                {editorialFeed.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="group relative"
                    >
                        {/* Parallax Image Container */}
                        <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-white/10 bg-surface mb-8 mx-auto w-full group-hover:border-primary/50 transition-colors">
                            <motion.img
                                style={{ y }}
                                src={item.img}
                                alt={item.title}
                                className="w-full h-[120%] object-cover object-center absolute -top-[10%] opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none" />
                            <div className="absolute top-4 left-4">
                                <Badge variant="outline" className="bg-black/80 backdrop-blur">{item.category}</Badge>
                            </div>
                        </div>

                        {/* Content Block */}
                        <div className="max-w-2xl mx-auto px-4 text-center">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="h-px w-12 bg-primary" />
                                <span className="label-mono text-primary">0{i + 1} // {new Date().toLocaleTimeString()}</span>
                                <div className="h-px w-12 bg-primary" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6 group-hover:text-primary transition-colors">
                                {item.title}
                            </h2>
                            <p className="text-xl text-white/60 font-medium leading-relaxed mb-8">
                                {item.desc}
                            </p>
                            <Button variant="ghost" className="mx-auto group/btn">
                                READ_LOG <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={16} />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* END MARKER */}
            <div className="mt-32 flex justify-center opacity-20">
                <div className="h-16 w-px bg-white" />
            </div>
        </div>
    );
}
