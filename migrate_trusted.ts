import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function migrate() {
    const { db } = await import("./src/lib/db");
    
    // As instructed by the user, running these one-by-one safely
    const queries = [
        "ALTER TABLE users ADD COLUMN is_trusted INTEGER DEFAULT 0;",
        "UPDATE users SET is_trusted = 1 WHERE google_id IS NOT NULL;"
    ];

    for (const q of queries) {
        try {
            console.log("Executing:", q);
            await db.execute(q);
        } catch (e: any) {
            console.log("Skipped (probably exists):", e.message);
        }
    }
    
    console.log("Done database updates for trusted layer.");
}

migrate();
