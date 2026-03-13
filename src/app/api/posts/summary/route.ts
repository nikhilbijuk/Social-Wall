import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const lastSeen = searchParams.get("lastSeen");
        
        if (!lastSeen) {
            return NextResponse.json({ summary: null });
        }

        const timestamp = parseInt(lastSeen);
        
        // Count new posts since last seen
        const postsRes = await db.execute({
            sql: "SELECT COUNT(*) as count FROM posts WHERE created_at > datetime(?, 'unixepoch')",
            args: [Math.floor(timestamp / 1000)]
        });

        // Get latest familiar name (most recent post author)
        const latestAuthorRes = await db.execute({
            sql: `
                SELECT u.name 
                FROM posts p 
                LEFT JOIN users u ON p.user_id = u.id 
                WHERE p.created_at > datetime(?, 'unixepoch')
                ORDER BY p.created_at DESC 
                LIMIT 1
            `,
            args: [Math.floor(timestamp / 1000)]
        });

        const count = Number(postsRes.rows[0].count);
        const latestName = latestAuthorRes.rows[0]?.name as string | undefined;

        return NextResponse.json({ 
            summary: {
                newPosts: count,
                latestName: latestName
            } 
        });
    } catch (error) {
        console.error("Summary API error:", error);
        return NextResponse.json({ summary: null });
    }
}
