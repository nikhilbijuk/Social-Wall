import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const anonId = cookieStore.get("anonId")?.value;

        if (!anonId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify admin status from DB
        const adminCheck = await db.execute({
            sql: "SELECT is_admin FROM users WHERE id = ?",
            args: [anonId]
        });

        const isAdmin = adminCheck.rows[0]?.is_admin === 1;

        if (!isAdmin) {
            // Fallback to secret for initial setup or legacy support
            const { searchParams } = new URL(req.url);
            const adminSecret = searchParams.get('adminSecret');
            if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const users = await db.execute({
            sql: "SELECT id, name, is_admin, is_verified, can_verify FROM users ORDER BY name ASC",
            args: []
        });

        return NextResponse.json(users.rows);
    } catch (error) {
        console.error("Fetch users error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
