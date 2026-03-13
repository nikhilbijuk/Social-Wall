import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Find a recent featured post (not deepfake, not blurred, within 20 mins)
        // Explicitly check for NULL or 0 to safely ensure clean content
        const res = await db.execute(`
            SELECT * FROM (
                SELECT p.*, u.name as author_name, u.is_verified, u.is_admin, u.is_trusted, u.avatar_url
                FROM posts p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE p.created_at > datetime('now', '-24 hours')
                  AND (p.is_blur IS NULL OR p.is_blur = 0)
                  AND (p.is_deepfake IS NULL OR p.is_deepfake = 0)
                LIMIT 30
            ) 
            ORDER BY RANDOM()
            LIMIT 1
        `);

        if (res.rows.length > 0) {
            return NextResponse.json({ spotlight: res.rows[0] });
        }

        return NextResponse.json({ spotlight: null });
    } catch (err: any) {
        console.error("Spotlight Error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
