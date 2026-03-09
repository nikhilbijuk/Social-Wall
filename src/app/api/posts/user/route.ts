import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
        }

        const query = `
            SELECT p.*, u.name as authorName, u.is_verified, p.created_at as formatted_date,
                   COALESCE(p.likes_count, 0) as likes_count,
                   COALESCE(p.thumbs_up_count, 0) as thumbs_up_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.timestamp DESC
            LIMIT 50
        `;

        const result = await db.execute({ sql: query, args: [userId] });

        const posts = result.rows.map(row => ({
            ...row,
            createdAt: typeof row.created_at === 'string' ? row.created_at.replace(" ", "T") + "Z" : row.created_at,
            timestamp: row.timestamp,
            fileUrl: row.file_url,
            mediaType: row.media_type,
        }));

        return NextResponse.json(posts);
    } catch (error) {
        console.error("User posts API error:", error);
        return NextResponse.json({ error: "Failed to fetch user posts" }, { status: 500 });
    }
}
