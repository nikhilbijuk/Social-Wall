import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import fs from "fs";

// Load from .env.local if exists, else .env
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
        console.log("Replacing spaces with underscores in all usernames...");
        await db.execute("UPDATE users SET name = REPLACE(name, ' ', '_')");
        console.log("Successfully migrated display names to tags.");
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

main();
