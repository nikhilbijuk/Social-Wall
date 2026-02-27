import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;

if (!url && process.env.NODE_ENV === "production") {
    console.warn("TURSO_DATABASE_URL is not defined. Database operations will fail.");
}

export const db = createClient({
    url: url || "http://localhost:8080", // Fallback for build time if necessary
    authToken: process.env.TURSO_AUTH_TOKEN || "",
});
