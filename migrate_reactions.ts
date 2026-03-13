import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function migrate() {
    const { db } = await import("./src/lib/db");
    
    const queries = [
        "CREATE TABLE IF NOT EXISTS reactions (user_id TEXT, post_id TEXT, type TEXT, created_at INTEGER, PRIMARY KEY (user_id, post_id, type));",
        "CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON reactions(created_at);"
    ];

    for (const q of queries) {
        try {
            console.log("Executing:", q);
            await db.execute(q);
        } catch (e: any) {
            console.log("Error or already exists:", e.message);
        }
    }
    
    console.log("Done database updates for reactions table.");
}

migrate();
