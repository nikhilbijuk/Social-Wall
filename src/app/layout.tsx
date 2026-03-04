import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProvider } from '@/context/AppContext';
import { Header, VerificationModalWrapper } from '@/components/ui/Header';

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
                <AppProvider>
                    <Header />
                    <main className="flex-1 max-w-4xl mx-auto w-full bg-white md:shadow-2xl relative">
                        {children}
                    </main>
                    <VerificationModalWrapper />
                </AppProvider>
            </body>
        </html>
    );
}
