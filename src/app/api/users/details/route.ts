import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tag = searchParams.get("tag");
        const id = searchParams.get("id");

        if (!tag && !id) {
            return NextResponse.json({ error: "No tag or ID provided" }, { status: 400 });
        }

        let query = "";
        let args: any[] = [];

        if (id) {
            query = "SELECT id, name, is_verified, role FROM users WHERE id = ?";
            args = [id];
        } else if (tag) {
            query = "SELECT id, name, is_verified, role FROM users WHERE REPLACE(name, ' ', '_') = ?";
            args = [tag];
        }

        const result = await db.execute({ sql: query, args });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            is_verified: result.rows[0].is_verified === 1,
            role: result.rows[0].role,
            tag: String(result.rows[0].name).replace(/\s+/g, "_")
        };

        return NextResponse.json(user);
    } catch (error) {
        console.error("User details API error:", error);
        return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
    }
}
