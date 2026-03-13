import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { anonId, googleId, email, avatarUrl, name } = await req.json();

        if (!anonId || !googleId) {
            return NextResponse.json({ error: "Missing required identity fields" }, { status: 400 });
        }

        // Try merging existing guest into Google Identity
        // We set auth_provider='google', and assign is_verified=1 unconditionally for Google users
        const safeName = (name || "Google User").replace(/\s+/g, '_').slice(0, 24);

        const updateRes = await db.execute({
            sql: `UPDATE users 
                  SET google_id = ?, email = ?, avatar_url = ?, auth_provider = 'google', is_verified = 1, name = COALESCE(name, ?) 
                  WHERE id = ?`,
            args: [googleId, email, avatarUrl, safeName, anonId]
        });

        if (updateRes.rowsAffected === 0) {
            // User did not exist as a guest for this anonId, or anonId doesn't match DB.
            // Check if google_id already exists in another row.
            const existingGoogle = await db.execute("SELECT id FROM users WHERE google_id = ?", [googleId]);
            if (existingGoogle.rows.length === 0) {
                // Completely new user across the board
                await db.execute({
                     sql: "INSERT INTO users (id, google_id, email, avatar_url, auth_provider, is_verified, name, role, is_admin) VALUES (?, ?, ?, ?, 'google', 1, ?, 'user', 0)",
                     args: [anonId, googleId, email, avatarUrl, safeName]
                });
            } else {
                // This google_id exists but on a different user id (e.g. cross-browser login).
                // We should probably just return the explicit parent id.
                return NextResponse.json({ success: true, merged_into: existingGoogle.rows[0].id });
            }
        }

        return NextResponse.json({ success: true, merged_into: anonId });
    } catch (err: any) {
        console.error("Identity Merge Error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
