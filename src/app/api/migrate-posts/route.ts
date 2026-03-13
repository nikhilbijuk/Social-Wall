import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { oldId, newId } = await req.json();

    if (!oldId || !newId || oldId === newId) {
      return NextResponse.json({ success: true, message: "No migration needed" });
    }

    // Transfer roles and flags (is_admin, is_trusted, is_verified)
    const oldUserResult = await db.execute({
      sql: "SELECT role, is_admin, is_verified, is_trusted FROM users WHERE id = ?",
      args: [oldId],
    });

    if (oldUserResult.rows.length > 0) {
      const oldUser = oldUserResult.rows[0];
      await db.execute({
        sql: `UPDATE users SET 
                role = CASE WHEN ? = 'admin' THEN 'admin' ELSE role END,
                is_admin = MAX(is_admin, ?),
                is_verified = MAX(is_verified, ?),
                is_trusted = MAX(is_trusted, ?)
              WHERE id = ?`,
        args: [oldUser.role, oldUser.is_admin, oldUser.is_verified, oldUser.is_trusted, newId],
      });
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
