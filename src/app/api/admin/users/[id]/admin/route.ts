import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { adminSecret, isAdmin } = await req.json();

        if (adminSecret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await db.execute("UPDATE users SET is_admin = ? WHERE id = ?", [isAdmin ? 1 : 0, id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin toggle error:", error);
        return NextResponse.json({ error: "Failed to update admin status" }, { status: 500 });
    }
}
