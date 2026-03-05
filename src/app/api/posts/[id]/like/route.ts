import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.execute("UPDATE posts SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = ?", [id]);

        // Log for real-time burst
        await db.execute("INSERT INTO reactions_log (post_id, type, timestamp) VALUES (?, ?, ?)", [id, 'like', Date.now()]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Like API error:", error);
        return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
    }
}
