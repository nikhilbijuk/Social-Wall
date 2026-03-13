import { db } from "./src/lib/db";

async function migrate() {
    console.log("Creating daily_votes table...");
    await db.execute(`
        CREATE TABLE IF NOT EXISTS daily_votes (
            user_id TEXT,
            prompt_id INTEGER,
            choice_index INTEGER,
            created_at INTEGER,
            PRIMARY KEY (user_id, prompt_id)
        );
    `);
    console.log("Migration complete!");
}

migrate();
