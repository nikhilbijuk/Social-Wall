import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { oldId, newId } = await req.json();

    if (!oldId || !newId || oldId === newId) {
      return NextResponse.json({ success: true, message: "No migration needed" });
    }

    // Migrate posts
    const postResult = await db.execute({
      sql: "UPDATE posts SET user_id = ? WHERE user_id = ?",
      args: [newId, oldId],
    });

    // Migrate reactions
    const reactionResult = await db.execute({
      sql: "UPDATE reactions SET user_id = ? WHERE user_id = ?",
      args: [newId, oldId],
    });

    // Migrate daily votes
    const voteResult = await db.execute({
      sql: "UPDATE daily_votes SET user_id = ? WHERE user_id = ?",
      args: [newId, oldId],
    });

    console.log(`Migrated ${postResult.rowsAffected} posts and ${reactionResult.rowsAffected} reactions from ${oldId} to ${newId}`);

    return NextResponse.json({ 
      success: true, 
      count: postResult.rowsAffected + reactionResult.rowsAffected + voteResult.rowsAffected 
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Failed to migrate posts" }, { status: 500 });
  }
}
