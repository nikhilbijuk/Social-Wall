import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/moderate-post
 * Updates post flags (is_deepfake, is_blur).
 * Body: { postId: string, field: string, value: any, adminSecret: string }
 */
export async function POST(req: Request) {
    try {
        const { postId, field, value, adminSecret } = await req.json();

        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const validFields = ['is_deepfake', 'is_blur', 'blur_reason'];
        if (!validFields.includes(field)) {
            return NextResponse.json({ error: "Invalid field" }, { status: 400 });
        }

        await db.execute({
            sql: `UPDATE posts SET ${field} = ? WHERE id = ?`,
            args: [value, postId]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Moderation error:", error);
        return NextResponse.json({ error: "Failed to moderate post" }, { status: 500 });
    }
}
