import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    pages: {
        signIn: "/",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" && user.id) {
                try {
                    const res = await db.execute("SELECT id FROM users WHERE id = ?", [user.id]);
                    if (res.rows.length === 0) {
                        const safeName = (user.name || "Guest").replace(/\s+/g, '_').slice(0, 24);
                        // Set is_trusted = 1 for Google users, keep is_verified for Admin approval
                        await db.execute(
                            "INSERT INTO users (id, name, role, is_admin, is_verified, is_trusted, can_verify, created_at) VALUES (?, ?, 'user', 0, 0, 1, 0, CURRENT_TIMESTAMP)",
                            [user.id, safeName]
                        );
                    }
                } catch (err) {
                    console.error("Failed to sync Google user to DB:", err);
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        }
    }
});
