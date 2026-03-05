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

        // Comprehensive Users Table Update
        console.log("Updating users table structure...");
        const userColumns = [
            "is_admin INTEGER DEFAULT 0",
            "is_verified INTEGER DEFAULT 0",
            "hearts INTEGER DEFAULT 0",
            "thumbs INTEGER DEFAULT 0",
            "posts INTEGER DEFAULT 0"
        ];

        for (const col of userColumns) {
            try {
                await db.execute(`ALTER TABLE users ADD COLUMN ${col}`);
            } catch (e) {
                // Ignore if column already exists
            }
        }

        // Platform State table
        console.log("Creating platform_state table...");
        await db.execute(`
            CREATE TABLE IF NOT EXISTS platform_state (
                id INTEGER PRIMARY KEY,
                level INTEGER DEFAULT 0
            )
        `);
        await db.execute("INSERT OR IGNORE INTO platform_state (id, level) VALUES (1, 0)");

        // Optimized Dynamic Leaderboard View
        console.log("Creating leaderboard view...");
        try {
            await db.execute("DROP VIEW IF EXISTS leaderboard");
            await db.execute(`
                CREATE VIEW leaderboard AS
                SELECT 
                    u.id as anon_id,
                    u.name,
                    u.is_verified,
                    (
                      COALESCE(SUM(p.likes_count), 0) * 3 + 
                      COALESCE(SUM(p.thumbs_up_count), 0) * 2 + 
                      COUNT(p.id)
                    ) AS score
                FROM users u
                LEFT JOIN posts p ON u.id = p.user_id
                WHERE u.name IS NOT NULL
                GROUP BY u.id
                ORDER BY score DESC
                LIMIT 50
            `);
        } catch (e) {
            console.error("View creation failed:", e);
        }

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

migrate();
