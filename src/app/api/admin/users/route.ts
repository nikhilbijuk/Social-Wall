import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * Fetches all registered users for manual moderation.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const adminSecret = searchParams.get('adminSecret');

        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
