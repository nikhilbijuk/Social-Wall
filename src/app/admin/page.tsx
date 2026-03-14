import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
    const session = await auth();
    
    // Server-side safety: Hard whitelist
    const ADMIN_EMAILS = [
        "nikhilbijuk@gmail.com", // Main Admin
        "user56@example.com"    // Dev/Testing
    ];

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
        redirect("/");
    }

    return <AdminClient />;
}
