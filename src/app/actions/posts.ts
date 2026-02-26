"use server";

import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

export async function createPostAction(formData: {
    content: string;
    fileUrl?: string;
    mediaType?: 'image' | 'video';
    userId: string;
    type?: string;
    tag?: string;
}) {
    const { content, fileUrl, mediaType, userId, type = 'update', tag = 'Update' } = formData;

    if (!content.trim() && !fileUrl) {
        throw new Error("Post cannot be empty");
    }

    if (content.includes("http")) {
        throw new Error("Links are not allowed for security reasons");
    }

    try {
        // Simple role/rate limit check (can be expanded later with NextAuth session)
        const userResult = await db.execute("SELECT role, last_post_time FROM users WHERE id = ?", [userId]);
        const user = userResult.rows[0];

        // For now, if user doesn't exist, we skip role checks or create a basic user record
        // In a real scenario, this would be handled by the auth session

        const id = uuidv4();
        const timestamp = Date.now();

        await db.execute(
            "INSERT INTO posts (id, content, type, tag, file_url, media_type, timestamp, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
            [id, content, type, tag, fileUrl || null, mediaType || null, timestamp, userId]
        );

        if (user) {
            await db.execute("UPDATE users SET last_post_time = CURRENT_TIMESTAMP WHERE id = ?", [userId]);
        }

        revalidatePath("/dashboard/explore");
        return { success: true, id };
    } catch (error: any) {
        console.error("Server Action Error:", error);
        throw new Error(error.message || "Failed to create post on server");
    }
}
