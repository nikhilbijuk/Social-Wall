import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Weighted leaderboard: hearts × 3 + thumbs × 2 + posts × 1
        const result = await db.execute(`
            SELECT 
              u.id,
              u.name,
              u.is_verified,
              COALESCE(p.total_posts, 0) AS total_posts,
              COALESCE(r.hearts, 0) AS hearts,
              COALESCE(r.thumbs, 0) AS thumbs,
              (
                COALESCE(r.hearts, 0) * 3 +
                COALESCE(r.thumbs, 0) * 2 +
                COALESCE(p.total_posts, 0)
              ) AS score
            FROM users u
            LEFT JOIN (
              SELECT user_id, COUNT(*) AS total_posts
              FROM posts
              GROUP BY user_id
            ) p ON p.user_id = u.id
            LEFT JOIN (
              SELECT 
                posts.user_id,
                SUM(CASE WHEN reactions.type = 'heart' THEN 1 ELSE 0 END) AS hearts,
                SUM(CASE WHEN reactions.type = 'thumb' THEN 1 ELSE 0 END) AS thumbs
              FROM reactions
              JOIN posts ON posts.id = reactions.post_id
              GROUP BY posts.user_id
            ) r ON r.user_id = u.id
            ORDER BY score DESC
            LIMIT 10
        `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("Leaderboard error:", error);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
