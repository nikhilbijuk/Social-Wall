import LeaderboardView from "@/components/Leaderboard";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function LeaderboardPage() {
    return (
        <div className="max-w-2xl mx-auto min-h-[calc(100dvh-64px)] bg-[#EFE7DD]">
            <div className="p-4 border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-[#00A884] transition-colors"
                >
                    <ChevronLeft size={16} />
                    <span>Back to Wall</span>
                </Link>
                <h1 className="text-sm font-black tracking-widest uppercase text-black/40">Engagement Hall</h1>
                <div className="w-16" /> {/* Spacer */}
            </div>

            <div className="p-2">
                <LeaderboardView />
            </div>
        </div>
    );
}
