import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import { existsSync } from "fs";

if (existsSync(".env.local")) {
    dotenv.config({ path: ".env.local" });
} else {
    dotenv.config();
}

const url = process.env.TURSO_DATABASE_URL || "http://127.0.0.1:8080";
const authToken = process.env.TURSO_AUTH_TOKEN || "";

const db = createClient({
    url,
    authToken,
});

async function main() {
    console.log("Creating post_tags table...");
    await db.execute(`
        CREATE TABLE IF NOT EXISTS post_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id TEXT,
            user_id TEXT,
            created_at INTEGER
        );
    `);
    console.log("post_tags table created successfully.");
}

main().catch(console.error);
