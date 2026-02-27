import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
});

import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
    title: "Social Wall | Visual Coordination Stream",
    description: "The premium real-time communication layer for high-performance teams.",
    icons: {
        icon: "/favicon.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            </head>
            <body className={`${inter.variable} font-sans antialiased text-[#111B21] transition-colors duration-500`}>
                <AppProvider>
                    <header className="fixed top-0 left-0 right-0 h-16 bg-[#EFE7DD] flex items-center justify-between px-6 z-50 border-b border-[#111B21]/5 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">Social Wall</h1>
                            <div className="h-4 w-px bg-black/10 mx-1 shrink-0" />
                            <span className="text-[10px] font-bold text-[#00A884] uppercase tracking-widest animate-pulse shrink-0">Live Connectivity</span>
                        </div>
                    </header>
                    <main className="pt-16 min-h-[100dvh] bg-[#EFE7DD]">
                        {children}
                    </main>
                </AppProvider>
            </body>
        </html>
    );
}
