import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { secret } = await req.json();

        if (secret === process.env.ADMIN_SECRET) {
            const res = NextResponse.json({ success: true });

            // Set secure HttpOnly cookie for admin session
            const cookieStore = await cookies();
            cookieStore.set("admin", "true", {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: "/",
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

            return res;
        }

        return NextResponse.json({ success: false, error: "Invalid secret" }, { status: 401 });
    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
    }
}
