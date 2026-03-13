import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "./src/lib/db";

async function verifyDb() {
    try {
        const result = await db.execute("PRAGMA table_info(users)");
        console.log("Database columns for 'users' table:");
        result.rows.forEach(row => {
            console.log(`- ${row.name} (${row.type})`);
        });
    } catch (e) {
        console.error("Error checking DB:", e);
    }
}

verifyDb();
