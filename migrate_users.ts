import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function migrate() {
    const { db } = await import("./src/lib/db");
    
    // As instructed by the user, running these one-by-one safely
    const queries = [
        "ALTER TABLE users ADD COLUMN google_id TEXT;",
        "ALTER TABLE users ADD COLUMN email TEXT;",
        "ALTER TABLE users ADD COLUMN avatar_url TEXT;",
        "ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'guest';",
        // Note: the original column for anonId is just 'id' in our table
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_id ON users(id);",
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);",
        "CREATE INDEX IF NOT EXISTS idx_users_admin_verified ON users(id, is_admin, is_verified);",
        "UPDATE users SET auth_provider = 'guest' WHERE auth_provider IS NULL;"
    ];

    for (const q of queries) {
        try {
            console.log("Executing:", q);
            await db.execute(q);
        } catch (e: any) {
            console.log("Skipped (probably exists):", e.message);
        }
    }
    
    console.log("Done database updates.");
}

migrate();
