import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/verify
 * Body: { name: string, secret: string }
 *
 * Toggles the `is_verified` field for a user by name.
 * Protected by ADMIN_SECRET environment variable.
 *
 * Usage (from terminal or any REST client):
 *   curl -X POST https://your-site.com/api/admin/verify \
 *     -H "Content-Type: application/json" \
 *     -d '{"name": "Alice", "secret": "your-admin-password"}'
 *
 * Response:
 *   { success: true, name: "Alice", is_verified: 1 }
 */
export async function POST(req: Request) {
    try {
        const { name, secret } = await req.json();

        // --- Auth check ---
        const adminSecret = process.env.ADMIN_SECRET;
        if (!adminSecret) {
            return NextResponse.json({ error: "ADMIN_SECRET is not configured on the server." }, { status: 500 });
        }
        if (!secret || secret !== adminSecret) {
            return NextResponse.json({ error: "Forbidden: Invalid admin secret." }, { status: 403 });
        }

        if (!name?.trim()) {
            return NextResponse.json({ error: "name is required." }, { status: 400 });
        }

        // --- Lookup user ---
        const result = await db.execute({
            sql: "SELECT id, name, is_verified FROM users WHERE LOWER(name) = LOWER(?)",
            args: [name.trim()],
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: `User "${name}" not found.` }, { status: 404 });
        }

        const user = result.rows[0];
        const currentlyVerified = Number(user.is_verified);
        const newVerifiedStatus = currentlyVerified === 1 ? 0 : 1;

        // --- Toggle is_verified ---
        await db.execute({
            sql: "UPDATE users SET is_verified = ? WHERE LOWER(name) = LOWER(?)",
            args: [newVerifiedStatus, name.trim()],
        });

        const action = newVerifiedStatus === 1 ? "✅ Verified" : "❌ Unverified";
        console.log(`[Admin] ${action}: ${user.name}`);

        return NextResponse.json({
            success: true,
            name: user.name,
            is_verified: newVerifiedStatus,
            message: `${action}: "${user.name}"`,
        });
    } catch (err: any) {
        console.error("Admin verify error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
