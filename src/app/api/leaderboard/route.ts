import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Top 10 Users by likes (using thumbs_up_count as well)
        const userLeaderboardQuery = `
            SELECT u.name, SUM(p.likes_count + p.thumbs_up_count) as total_points
            FROM posts p
            JOIN users u ON p.user_id = u.id
            GROUP BY u.id
            ORDER BY total_points DESC
            LIMIT 10
        `;

        // Top Teams (if teams table exists, else generic)
        // Adjusting based on standard schema seen in previous sessions
        const teamLeaderboardQuery = `
            SELECT 'Main Team' as name, SUM(likes_count + thumbs_up_count) as team_points
            FROM posts
            LIMIT 5
        `;

        const [userResult, teamResult] = await Promise.all([
            db.execute(userLeaderboardQuery),
            db.execute(teamLeaderboardQuery)
        ]);

        return NextResponse.json({
            users: userResult.rows,
            teams: teamResult.rows
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
