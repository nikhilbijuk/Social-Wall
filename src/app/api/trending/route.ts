import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch the highest scoring post in the last 30 minutes.
        // Score = (likes_count * 3) + (thumbs_up_count * 2)
        // Ensure post is neither blurred nor deepfaked.
        const result = await db.execute(`
            SELECT *,
            (likes_count * 3 + thumbs_up_count * 2) AS score
            FROM posts
            WHERE created_at > datetime('now', '-30 minutes')
              AND (is_blur IS NULL OR is_blur = 0)
              AND (is_deepfake IS NULL OR is_deepfake = 0)
            ORDER BY score DESC, created_at DESC
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            return NextResponse.json({ trending: null });
        }

        return NextResponse.json({ trending: result.rows[0] });
    } catch (error) {
        console.error("Failed to fetch trending post:", error);
        return NextResponse.json({ error: "Failed to fetch trending post" }, { status: 500 });
    }
}
