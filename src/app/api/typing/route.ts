import { NextResponse } from "next/server";

// In-memory store for typing users (Vercel serverless has limitations here, 
// but for a demo/low-traffic wall this is the simplest approach without Redis)
let typingUsers = new Map<string, { name: string, lastActive: number }>();

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { userId, name, isTyping } = await req.json();

        if (isTyping) {
            typingUsers.set(userId, { name, lastActive: Date.now() });
        } else {
            typingUsers.delete(userId);
        }

        // Cleanup old typing statuses (older than 5s)
        const now = Date.now();
        for (const [id, status] of typingUsers.entries()) {
            if (now - status.lastActive > 5000) {
                typingUsers.delete(id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update typing status" }, { status: 500 });
    }
}

// Export a helper to get currently typing users for the SSE stream
export function getTypingUsers() {
    const now = Date.now();
    const active = [];
    for (const [id, status] of typingUsers.entries()) {
        if (now - status.lastActive < 5000) {
            active.push(status.name);
        }
    }
    return active;
}
