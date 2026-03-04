import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * POST /api/sync/generate
 * Generates a 6-digit sync code for a user.
 */
export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes from now

        // Ensure table exists (migration fallback)
        await db.execute("CREATE TABLE IF NOT EXISTS sync_codes (code TEXT PRIMARY KEY, user_id TEXT, expires_at INTEGER)");

        // Clean up old codes for this user
        await db.execute({
            sql: "DELETE FROM sync_codes WHERE user_id = ? OR expires_at < ?",
            args: [userId, Date.now()]
        });

        // Insert new code
        await db.execute({
            sql: "INSERT INTO sync_codes (code, user_id, expires_at) VALUES (?, ?, ?)",
            args: [code, userId, expiresAt]
        });

        return NextResponse.json({ code });
    } catch (error) {
        console.error("Sync generate error:", error);
        return NextResponse.json({ error: "Failed to generate sync code" }, { status: 500 });
    }
}
