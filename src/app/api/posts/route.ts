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

        let query = `
            SELECT p.*, u.name as authorName, u.is_verified, p.created_at as formatted_date 
            FROM posts p 
            LEFT JOIN users u ON p.user_id = u.id
        `;
        let args: any[] = [];

        if (before) {
            query += " WHERE p.timestamp < ? ORDER BY p.timestamp DESC LIMIT ?";
            args = [parseInt(before), limit];
        } else {
            query += " ORDER BY p.timestamp DESC LIMIT ?";
            args = [limit];
        }

        const result = await db.execute({ sql: query, args });

        const posts = result.rows.map(row => ({
            ...row,
            createdAt: row.created_at,
            timestamp: row.timestamp,
        }));

        return NextResponse.json(posts);
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}
