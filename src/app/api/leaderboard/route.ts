import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.execute(`
            SELECT 
              u.id,
              u.name,
              u.is_verified,
              COUNT(p.id) AS total_posts,
              SUM(COALESCE(p.likes_count, 0)) AS hearts,
              SUM(COALESCE(p.thumbs_up_count, 0)) AS thumbs,
              (
                SUM(COALESCE(p.likes_count, 0)) * 3 +
                SUM(COALESCE(p.thumbs_up_count, 0)) * 2 +
                COUNT(p.id)
              ) AS score
            FROM users u
            INNER JOIN posts p ON p.user_id = u.id
            GROUP BY u.id, u.name, u.is_verified
            ORDER BY score DESC
            LIMIT 10
        `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
