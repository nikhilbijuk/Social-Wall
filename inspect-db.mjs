import { createClient } from "@libsql/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    try {
        const result = await client.execute("SELECT name, sql FROM sqlite_master WHERE type='table'");
        console.log("Database Schema:");
        result.rows.forEach(row => {
            console.log(`\nTable: ${row.name}`);
            console.log(row.sql);
        });
    } catch (err) {
        console.error("Error fetching schema:", err);
    } finally {
        process.exit();
    }
}

main();
