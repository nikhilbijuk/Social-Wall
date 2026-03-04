import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL || "http://localhost:8080",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
});

async function migrate() {
    console.log("Starting migration...");

    try {
        // Add index for leaderboard performance
        console.log("Adding index idx_posts_user_id...");
        await db.execute("CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)");

        // Add index for timestamp pagination
        console.log("Adding index idx_posts_timestamp...");
        await db.execute("CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp)");

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

migrate();
