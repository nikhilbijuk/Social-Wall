import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET current active prompt
export async function GET() {
    try {
        const res = await db.execute("SELECT * FROM live_prompt WHERE active = 1 ORDER BY id DESC LIMIT 1");
        if (res.rows.length > 0) {
            return NextResponse.json({ prompt: res.rows[0].text });
        }
        return NextResponse.json({ prompt: "Share what you're enjoying right now 🔥" });
    } catch (err: any) {
        console.error("Live Prompt Fetch Error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST new prompt (Admin Only in a real app, assuming authenticated route checks)
export async function POST(req: Request) {
    try {
        const { text, userId } = await req.json();

        // Basic admin check - ideally via session or middleware
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const adminCheck = await db.execute("SELECT is_admin FROM users WHERE id = ?", [userId]);
        if (!adminCheck.rows.length || !adminCheck.rows[0].is_admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (!text || !text.trim()) {
            // Deactivate all prompts if empty text is sent
            await db.execute("UPDATE live_prompt SET active = 0");
            return NextResponse.json({ success: true, prompt: null });
        }

        // Deactivate old ones
        await db.execute("UPDATE live_prompt SET active = 0");

        // Insert new active prompt
        await db.execute({
            sql: "INSERT INTO live_prompt (text, active) VALUES (?, 1)",
            args: [text.trim()]
        });

        return NextResponse.json({ success: true, prompt: text.trim() });
    } catch (err: any) {
        console.error("Live Prompt Update Error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
