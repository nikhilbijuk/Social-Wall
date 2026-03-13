import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { userId, promptId, choiceIndex } = await req.json();

        if (!userId || promptId === undefined || choiceIndex === undefined) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        await db.execute({
            sql: "INSERT OR REPLACE INTO daily_votes (user_id, prompt_id, choice_index, created_at) VALUES (?, ?, ?, ?)",
            args: [userId, promptId, choiceIndex, Date.now()]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Pulse vote error:", error);
        return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const promptId = searchParams.get("promptId");

        if (!promptId) {
            return NextResponse.json({ error: "Missing promptId" }, { status: 400 });
        }

        const results = await db.execute({
            sql: "SELECT choice_index, COUNT(*) as count FROM daily_votes WHERE prompt_id = ? GROUP BY choice_index",
            args: [promptId]
        });

        return NextResponse.json({ results: results.rows });
    } catch (error) {
        console.error("Pulse results error:", error);
        return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
    }
}
