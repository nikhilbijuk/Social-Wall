import { useApp } from '../context/AppContext';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function EventsPage() {
    const { currentEvent } = useApp();

    return (
        <div className="max-w-4xl mx-auto">
            {/* Industrial Header */}
            <header className="mb-12 relative">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="label-mono text-primary">Live_Transit_Map: Alpha_01</div>
                </div>
                <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">Timeline_Log</h2>
                <div className="annotation absolute -bottom-6 right-0 rotate-[-2deg] opacity-40">
                    Stay on track! →
                </div>
            </header>

            <div className="relative pl-8 md:pl-0">
                {/* SVG Transit Line Background */}
                <div className="absolute left-[39px] md:left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 z-0 hidden md:block">
                    <svg className="h-full w-full overflow-visible">
                        <defs>
                            <linearGradient id="transit-line" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#DFFF00" stopOpacity="0.2" />
                                <stop offset="50%" stopColor="#DFFF00" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#DFFF00" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>
                        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#transit-line)" strokeWidth="4" strokeDasharray="12 4" strokeLinecap="round" />
                    </svg>
                </div>
                {/* Mobile Line */}
                <div className="absolute left-[2px] top-4 bottom-4 w-[2px] bg-white/10 md:hidden" />

                <div className="space-y-16">
                    {currentEvent?.schedule.map((item, index) => {
                        const isEven = index % 2 === 0;
                        const isLive = item.status === 'live';

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "relative md:flex items-center justify-between gap-12",
                                    isEven ? "md:flex-row-reverse" : ""
                                )}
                            >
                                {/* Center Node (Transit Stop) */}
                                <div className="absolute left-[-2px] md:left-1/2 top-0 md:top-1/2 w-4 h-4 md:w-6 md:h-6 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                                    <div className={cn(
                                        "w-full h-full rounded-full border-4 transition-all duration-500",
                                        isLive
                                            ? "bg-black border-primary shadow-[0_0_20px_#DFFF00] scale-125"
                                            : item.status === 'completed'
                                                ? "bg-white/10 border-white/20"
                                                : "bg-black border-white/10"
                                    )} />
                                    {isLive && <div className="absolute inset-0 bg-primary/30 animate-ping rounded-full" />}
                                </div>

                                {/* Time Label (Opposite Side) */}
                                <div className={cn(
                                    "hidden md:block w-1/2 text-right opacity-50 font-mono text-sm",
                                    isEven ? "text-left" : "text-right"
                                )}>
                                    {item.time}
                                </div>

                                {/* Content Card */}
                                <div className="md:w-1/2 pl-8 md:pl-0">
                                    <div className="md:hidden label-mono text-primary mb-2 text-xs">{item.time}</div>
                                    <GlassCard
                                        label={`STOP_${index + 1}`}
                                        className={cn(
                                            "p-6 group transition-all duration-500",
                                            isLive
                                                ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                                                : "hover:border-white/20"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={cn(
                                                "font-black text-2xl uppercase tracking-tighter transition-colors",
                                                isLive ? "text-white" : "text-white/60 group-hover:text-white"
                                            )}>
                                                {item.title}
                                            </h3>
                                            <StatusBadge status={item.status} />
                                        </div>

                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5 opacity-60">
                                            <div className="flex items-center gap-2 label-mono text-[9px]">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", isLive ? "bg-primary" : "bg-white/50")} />
                                                {item.type.toUpperCase()}
                                            </div>
                                        </div>
                                    </GlassCard>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'live': return <Badge variant="error" className="animate-pulse">LIVE NOW</Badge>;
        case 'completed': return <Badge variant="outline">Completed</Badge>;
        default: return <Badge variant="default">Upcoming</Badge>;
    }
}
