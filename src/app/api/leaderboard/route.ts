import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Calculate Today's Energy (last 24h)
    // We sum up activity from posts and reactions in the last 24h
    const result = await db.execute(`
      WITH DailyStats AS (
        SELECT 
          u.id, 
          u.name, 
          u.is_verified,
          (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id AND p.created_at > datetime('now', '-24 hours')) as today_posts,
          (SELECT COUNT(*) FROM reactions r WHERE r.user_id = u.id AND r.created_at > datetime('now', '-24 hours')) as today_reactions
        FROM users u
      )
      SELECT * FROM DailyStats
      WHERE today_posts > 0 OR today_reactions > 0
      ORDER BY (today_posts * 5 + today_reactions) DESC
      LIMIT 10
    `);

    let rows = result.rows.map(row => ({
        ...row,
        score: Number(row.today_posts) * 5 + Number(row.today_reactions),
        total_posts: row.today_posts,
        hearts: row.today_reactions,
        thumbs: 0
    }));

    // Fallback: If no today activity, show all-time leaders to keep the cup icon "feeling" premium
    if (rows.length === 0) {
      const allTime = await db.execute(`
        SELECT u.id, u.name, u.is_verified, l.score, l.total_posts, l.hearts, l.thumbs
        FROM leaderboard l
        JOIN users u ON l.id = u.id
        ORDER BY score DESC
        LIMIT 10
      `);
      rows = allTime.rows.map(r => ({ 
        ...r, 
        is_fallback: true,
        score: Number(r.score || 0),
        total_posts: Number(r.total_posts || 0),
        hearts: Number(r.hearts || 0),
        thumbs: Number(r.thumbs || 0)
      }));
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
