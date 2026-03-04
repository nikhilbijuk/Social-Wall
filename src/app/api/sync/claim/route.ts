import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * POST /api/sync/claim
 * Claims a sync code to retrieve user identity on a new device.
 */
export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Code required" }, { status: 400 });
        }

        // Find the code
        const result = await db.execute({
            sql: "SELECT user_id, expires_at FROM sync_codes WHERE code = ?",
            args: [code]
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
        }

        const { user_id, expires_at } = result.rows[0] as any;

        if (expires_at < Date.now()) {
            await db.execute({ sql: "DELETE FROM sync_codes WHERE code = ?", args: [code] });
            return NextResponse.json({ error: "Code expired" }, { status: 410 });
        }

        // Get full user profile
        const userRes = await db.execute({
            sql: "SELECT * FROM users WHERE id = ?",
            args: [user_id]
        });

        if (userRes.rows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = userRes.rows[0];

        // Clean up code! (single use)
        await db.execute({ sql: "DELETE FROM sync_codes WHERE code = ?", args: [code] });

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Sync claim error:", error);
        return NextResponse.json({ error: "Failed to claim sync code" }, { status: 500 });
    }
}
