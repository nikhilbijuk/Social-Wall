import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";

        let result;
        if (!query.trim()) {
            // Return top 5 users if no specific query
            result = await db.execute({
                sql: "SELECT id, name, is_verified FROM users LIMIT 5",
                args: []
            });
        } else {
            result = await db.execute({
                sql: "SELECT id, name, is_verified FROM users WHERE REPLACE(name, ' ', '_') LIKE ? LIMIT 5",
                args: [`${query}%`]
            });
        }

        // Add a "tag" field which is the name with spaces replaced by underscores
        const users = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            tag: String(row.name).replace(/\s+/g, "_"),
            is_verified: row.is_verified === 1
        }));

        return NextResponse.json(users);
    } catch (error) {
        console.error("User search error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
