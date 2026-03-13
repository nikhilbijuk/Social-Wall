import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProvider } from '@/context/AppContext';
import { SessionProvider } from "next-auth/react";
import { Header, VerificationModalWrapper } from '@/components/ui/Header';
import { EmojiBurst } from '@/components/ui/EmojiBurst';

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
});

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
            <body className={cn(inter.className, "bg-[#EFE7DD] flex flex-col min-h-screen")}>
                <SessionProvider>
                    <AppProvider>
                        <EmojiBurst />
                        <Header />
                        <main className="flex-1 w-full relative">
                            {children}
                        </main>
                        <VerificationModalWrapper />
                    </AppProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
