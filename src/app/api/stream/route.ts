import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getTypingUsers } from "../typing/route";

export const dynamic = 'force-dynamic';

export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            let lastTimestamp = Date.now();
            let lastTypingUsersStr = "";

            const interval = setInterval(async () => {
                try {
                    // 1. Handle Typing Status
                    const typingUsers = getTypingUsers();
                    const typingStr = JSON.stringify(typingUsers);

                    if (typingStr !== lastTypingUsersStr) {
                        controller.enqueue(encoder.encode(`event: typing\ndata: ${typingStr}\n\n`));
                        lastTypingUsersStr = typingStr;
                    }

                    // 2. Handle New Posts
                    const result = await db.execute({
                        sql: `
                            SELECT p.*, u.name as authorName, u.is_verified, p.created_at as formatted_date,
                                   COALESCE(p.likes_count, 0) as likes_count,
                                   COALESCE(p.thumbs_up_count, 0) as thumbs_up_count
                            FROM posts p 
                            LEFT JOIN users u ON p.user_id = u.id
                            WHERE p.timestamp > ?
                            ORDER BY p.timestamp ASC
                        `,
                        args: [lastTimestamp]
                    });

                    if (result.rows.length > 0) {
                        const newPosts = result.rows.map(row => ({
                            ...row,
                            createdAt: typeof row.created_at === 'string' ? row.created_at.replace(" ", "T") + "Z" : row.created_at,
                            timestamp: row.timestamp,
                            fileUrl: row.file_url,
                            mediaType: row.media_type,
                        }));

                        lastTimestamp = Math.max(...newPosts.map(p => p.timestamp as number));
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(newPosts)}\n\n`));
                    }

                    // 3. Handle Reactions
                    const reactionResult = await db.execute({
                        sql: "SELECT * FROM reactions_log WHERE timestamp > ? ORDER BY timestamp ASC",
                        args: [lastTimestamp]
                    });

                    if (reactionResult.rows.length > 0) {
                        controller.enqueue(encoder.encode(`event: reaction\ndata: ${JSON.stringify(reactionResult.rows)}\n\n`));
                    }

                } catch (error) {
                    console.error("SSE Stream Error:", error);
                }
            }, 1500); // Check every 1.5 seconds

            // Clean up when the connection is closed
            return () => clearInterval(interval);
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
