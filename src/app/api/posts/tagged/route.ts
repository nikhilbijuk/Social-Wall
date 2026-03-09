import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tag = searchParams.get("tag");

        if (!tag) {
            return NextResponse.json({ error: "No tag provided" }, { status: 400 });
        }

        const query = `
            SELECT p.*, u.name as authorName, u.is_verified, p.created_at as formatted_date,
                   COALESCE(p.likes_count, 0) as likes_count,
                   COALESCE(p.thumbs_up_count, 0) as thumbs_up_count
            FROM posts p
            JOIN post_tags pt ON p.id = pt.post_id
            JOIN users tu ON pt.user_id = tu.id
            LEFT JOIN users u ON p.user_id = u.id
            WHERE tu.name = ? 
               OR tu.id = ?
            ORDER BY p.timestamp DESC
            LIMIT 50
        `;

        // We match either by the exact tag string (spaces replaced by underscore) or by user ID
        const result = await db.execute({ sql: query, args: [tag, tag] });

        const posts = result.rows.map(row => ({
            ...row,
            createdAt: typeof row.created_at === 'string' ? row.created_at.replace(" ", "T") + "Z" : row.created_at,
            timestamp: row.timestamp,
            fileUrl: row.file_url,
            mediaType: row.media_type,
        }));

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Tags API error:", error);
        return NextResponse.json({ error: "Failed to fetch tagged posts" }, { status: 500 });
    }
}
