import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        // 1. Check for recent reaction (3s cooldown)
        const recentRes = await db.execute({
            sql: "SELECT created_at FROM reactions WHERE user_id = ? AND post_id = ? AND type = 'like' ORDER BY created_at DESC LIMIT 1",
            args: [userId, id]
        });

        if (recentRes.rows.length > 0) {
            const lastTime = Number(recentRes.rows[0].created_at);
            if (Date.now() - lastTime < 3000) {
                return NextResponse.json({ error: "Too fast! Wait 3s." }, { status: 429 });
            }
        }

        // 2. Check for existence (Unique constraint handle)
        // Since we use PRIMARY KEY(user_id, post_id, type), we can use INSERT OR IGNORE
        // or just handle the error. For now, let's treat it as a toggle or just a single reaction.
        // User requested "Each user counts only once".
        
        const exists = await db.execute({
            sql: "SELECT 1 FROM reactions WHERE user_id = ? AND post_id = ? AND type = 'like'",
            args: [userId, id]
        });

        if (exists.rows.length > 0) {
            return NextResponse.json({ error: "Already liked!" }, { status: 400 });
        }

        // 3. Perform atomic update
        await db.execute("BEGIN TRANSACTION");
        try {
            await db.execute({
                sql: "INSERT INTO reactions (user_id, post_id, type, created_at) VALUES (?, ?, 'like', ?)",
                args: [userId, id, Date.now()]
            });
            await db.execute("UPDATE posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = ?", [id]);
            // Log for real-time burst (SSE)
            await db.execute("INSERT INTO reactions_log (post_id, type, timestamp) VALUES (?, ?, ?)", [id, 'like', Date.now()]);
            await db.execute("COMMIT");
        } catch (e) {
            await db.execute("ROLLBACK");
            throw e;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Like API error:", error);
        return NextResponse.json({ error: error.message || "Failed to update like" }, { status: 500 });
    }
}
