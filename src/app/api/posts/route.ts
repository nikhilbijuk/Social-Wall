import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

export const dynamic = 'force-dynamic';

dayjs.extend(relativeTime);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const before = searchParams.get("before");
        const after = searchParams.get("after");

        let query = `
            SELECT * FROM (
                SELECT p.*, u.name as authorName, u.is_verified, p.created_at as formatted_date,
                       COALESCE(p.likes_count, 0) as likes_count,
                       COALESCE(p.thumbs_up_count, 0) as thumbs_up_count
                FROM posts p 
                LEFT JOIN users u ON p.user_id = u.id
                ${before ? 'WHERE p.timestamp < ?' : (after ? 'WHERE p.timestamp > ?' : '')}
                ORDER BY p.timestamp DESC 
                LIMIT ?
            ) ORDER BY timestamp ASC
        `;
        let args: any[] = (before || after) ? [parseInt(before || after!), limit] : [limit];

        const result = await db.execute({ sql: query, args });

        const posts = result.rows.map(row => ({
            ...row,
            createdAt: typeof row.created_at === 'string' ? row.created_at.replace(" ", "T") + "Z" : row.created_at,
            timestamp: row.timestamp,
            fileUrl: row.file_url,
            mediaType: row.media_type,
        }));

        return NextResponse.json(posts);
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}
