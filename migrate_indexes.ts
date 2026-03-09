import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env.local")) {
    dotenv.config({ path: ".env.local" });
} else {
    dotenv.config();
}

const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
    try {
        console.log("Adding performance indexes to the database...");

        // 1. Usernames
        await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_name_unique ON users(name COLLATE NOCASE)");

        // 2. Post tags
        await db.execute("CREATE INDEX IF NOT EXISTS idx_post_tags_user ON post_tags(user_id)");
        await db.execute("CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id)");

        // 3. Posts sorting
        // Note: the main query uses `timestamp` and `created_at`
        await db.execute("CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp)");

        console.log("Successfully created all indexes.");
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

main();
