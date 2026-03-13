import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function migrate() {
    const { db } = await import("./src/lib/db");
    
    const queries = [
        "CREATE TABLE IF NOT EXISTS live_prompt (id INTEGER PRIMARY KEY, text TEXT, active INTEGER DEFAULT 1);"
    ];

    for (const q of queries) {
        try {
            console.log("Executing:", q);
            await db.execute(q);
        } catch (e: any) {
            console.log("Skipped (probably exists):", e.message);
        }
    }
    
    console.log("Done database updates for live prompt.");
}

migrate();
