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

        // Add is_admin column to users
        console.log("Adding is_admin column to users...");
        try {
            await db.execute("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0");
        } catch (e) {
            console.log("is_admin column already exists or failed to add:", e);
        }

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

migrate();
