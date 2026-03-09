import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET: Check if an anonId already has a registered name
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const anonId = searchParams.get("anonId");

    if (!anonId) {
        return NextResponse.json({ error: "anonId is required" }, { status: 400 });
    }

    try {
        const result = await db.execute({
            sql: "SELECT id, name, is_admin, is_verified, can_verify FROM users WHERE id = ?",
            args: [anonId],
        });

        if (result.rows.length > 0) {
            const user = result.rows[0];
            return NextResponse.json({
                registered: true,
                user: {
                    id: user.id,
                    name: user.name,
                    is_admin: !!user.is_admin,
                    is_verified: !!user.is_verified,
                    can_verify: !!user.can_verify
                }
            });
        }

        return NextResponse.json({ registered: false });
    } catch (err: any) {
        console.error("Register GET error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST: Reserve a name and create the user record
export async function POST(req: Request) {
    try {
        const { anonId, name } = await req.json();

        if (!anonId || !name?.trim()) {
            return NextResponse.json({ error: "anonId and name are required" }, { status: 400 });
        }

        const trimmedName = name.trim().replace(/\s+/g, '_');

        if (trimmedName.length < 2 || trimmedName.length > 24) {
            return NextResponse.json({ error: "Name must be between 2 and 24 characters" }, { status: 400 });
        }

        // Check if name is already taken (case-insensitive)
        const nameCheck = await db.execute({
            sql: "SELECT id FROM users WHERE LOWER(name) = LOWER(?)",
            args: [trimmedName],
        });

        if (nameCheck.rows.length > 0) {
            return NextResponse.json({ error: "Name already taken. Choose a different name." }, { status: 409 });
        }

        // Check if this anonId already has a name (edge case double register)
        const idCheck = await db.execute({
            sql: "SELECT name FROM users WHERE id = ?",
            args: [anonId],
        });

        if (idCheck.rows.length > 0) {
            return NextResponse.json({ registered: true, name: idCheck.rows[0].name });
        }

        // Insert new user
        await db.execute({
            sql: "INSERT INTO users (id, name, role, is_admin, is_verified, can_verify, created_at) VALUES (?, ?, 'guest', 0, 0, 0, CURRENT_TIMESTAMP)",
            args: [anonId, trimmedName],
        });

        return NextResponse.json({
            success: true,
            user: {
                id: anonId,
                name: trimmedName,
                is_admin: false,
                is_verified: false,
                can_verify: false
            }
        });
    } catch (err: any) {
        console.error("Register POST error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
