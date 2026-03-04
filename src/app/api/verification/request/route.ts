import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export const dynamic = 'force-dynamic';

/**
 * POST /api/verification/request
 * Submits an ID card for user verification.
 */
export async function POST(req: Request) {
    try {
        const { userId, idCardUrl } = await req.json();

        if (!userId || !idCardUrl) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // Ensure table exists
        await db.execute("CREATE TABLE IF NOT EXISTS verification_requests (id TEXT PRIMARY KEY, user_id TEXT, id_card_url TEXT, status TEXT DEFAULT 'pending', created_at INTEGER)");

        // Prevent duplicates
        const existing = await db.execute({
            sql: "SELECT id FROM verification_requests WHERE user_id = ? AND status = 'pending'",
            args: [userId]
        });

        if (existing.rows.length > 0) {
            return NextResponse.json({ error: "Verification request already pending" }, { status: 409 });
        }

        const requestId = nanoid();
        await db.execute({
            sql: "INSERT INTO verification_requests (id, user_id, id_card_url, status, created_at) VALUES (?, ?, ?, 'pending', ?)",
            args: [requestId, userId, idCardUrl, Date.now()]
        });

        return NextResponse.json({ success: true, requestId });
    } catch (error) {
        console.error("Verification request error:", error);
        return NextResponse.json({ error: "Failed to submit verification request" }, { status: 500 });
    }
}
