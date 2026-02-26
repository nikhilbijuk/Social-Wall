import { createClient } from "@libsql/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    const migrations = [
        "ALTER TABLE posts ADD COLUMN updated_at DATETIME;",
        "ALTER TABLE posts ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0;",
        "ALTER TABLE users ADD COLUMN last_post_time DATETIME;"
    ];

    console.log("Applying migrations...");

    for (const sql of migrations) {
        try {
            console.log(`Executing: ${sql}`);
            await client.execute(sql);
            console.log("Success.");
        } catch (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("Column already exists, skipping.");
            } else {
                console.error(`Error executing migration: ${err.message}`);
            }
        }
    }

    console.log("\nMigrations complete.");
    process.exit();
}

main();
