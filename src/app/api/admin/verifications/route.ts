import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/verifications
 * Fetches pending verification requests.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const adminSecret = searchParams.get('adminSecret');

        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const requests = await db.execute({
            sql: `
                SELECT vr.*, u.name as userName 
                FROM verification_requests vr
                JOIN users u ON vr.user_id = u.id
                WHERE vr.status = 'pending'
                ORDER BY vr.created_at DESC
            `,
            args: []
        });

        return NextResponse.json(requests.rows);
    } catch (error) {
        console.error("Fetch verifications error:", error);
        return NextResponse.json({ error: "Failed to fetch verifications" }, { status: 500 });
    }
}

/**
 * POST /api/admin/verifications/approve
 * Approves (or denies) a request.
 */
export async function POST(req: Request) {
    try {
        const { requestId, userId, action, adminSecret } = await req.json();

        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (action === 'approve') {
            // Transaction-like update
            await db.execute({
                sql: "UPDATE users SET is_verified = 1 WHERE id = ?",
                args: [userId]
            });
            await db.execute({
                sql: "UPDATE verification_requests SET status = 'approved' WHERE id = ?",
                args: [requestId]
            });
        } else {
            await db.execute({
                sql: "UPDATE verification_requests SET status = 'denied' WHERE id = ?",
                args: [requestId]
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Approve verification error:", error);
        return NextResponse.json({ error: "Action failed" }, { status: 500 });
    }
}
