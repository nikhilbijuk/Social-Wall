import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Calculate Today's Energy (last 24h)
    // We sum up activity from posts and reactions in the last 24h
    const result = await db.execute(`
      SELECT 
        u.id, 
        u.name, 
        u.is_verified,
        (
          SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id AND p.created_at > datetime('now', '-24 hours')
        ) as today_posts,
        (
          SELECT COUNT(*) FROM reactions r WHERE r.user_id = u.id AND r.created_at > datetime('now', '-24 hours')
        ) as today_reactions,
        l.score as all_time_score
      FROM users u
      LEFT JOIN leaderboard l ON u.id = l.id
      WHERE (
        SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id AND p.created_at > datetime('now', '-24 hours')
      ) > 0 OR (
        SELECT COUNT(*) FROM reactions r WHERE r.user_id = u.id AND r.created_at > datetime('now', '-24 hours')
      ) > 0
      ORDER BY (today_posts * 2 + today_reactions) DESC
      LIMIT 10
    `);

    const rows = result.rows.map(row => ({
        ...row,
        score: Number(row.today_posts) * 5 + Number(row.today_reactions), // Simplified daily energy score
        total_posts: row.today_posts,
        hearts: row.today_reactions,
        thumbs: 0 // We'll simplify for daily view
    }));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
