import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full gap-4 bg-[#EFE7DD]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-[#00A884]/20 border-t-[#00A884] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full shadow-sm" />
                </div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] font-black tracking-[0.2em] text-black/40 uppercase">Synchronizing Stream</p>
                <div className="w-32 h-1 bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00A884] animate-[shimmer_2s_infinite]" style={{ width: '60%' }} />
                </div>
            </div>
        </div>
    );
}
