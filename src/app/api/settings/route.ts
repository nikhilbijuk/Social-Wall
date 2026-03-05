import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * GET /api/settings
 * Returns the current platform mode (level).
 */
export async function GET() {
    try {
        const result = await db.execute("SELECT level FROM platform_state WHERE id = 1");
        if (result.rows.length === 0) {
            await db.execute("INSERT OR IGNORE INTO platform_state (id, level) VALUES (1, 0)");
            return NextResponse.json({ level: 0 });
        }
        return NextResponse.json({ level: Number(result.rows[0].level) });
    } catch (error) {
        console.error("Settings GET error:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

/**
 * POST /api/settings
 * Updates the platform level.
 */
export async function POST(req: Request) {
    try {
        const { level, adminSecret } = await req.json();

        // Still supporting secret for now as a fallback, but we'll add session check later
        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (typeof level !== 'number' || level < 0 || level > 3) {
            return NextResponse.json({ error: "Invalid level" }, { status: 400 });
        }

        await db.execute({
            sql: "UPDATE platform_state SET level = ? WHERE id = 1",
            args: [level]
        });

        return NextResponse.json({ success: true, level });
    } catch (error) {
        console.error("Settings POST error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
