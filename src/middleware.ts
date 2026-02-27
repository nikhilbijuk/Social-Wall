import { auth } from "@/auth";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
    const isExploreRoute = req.nextUrl.pathname === '/dashboard/explore';

    // Redirect to login page ONLY if trying to access dashboard routes (except explore) while not logged in
    if (isDashboardRoute && !isExploreRoute && !isLoggedIn) {
        return Response.redirect(new URL('/', req.nextUrl));
    }

    // Redirect to dashboard if logged in and trying to access root
    if (req.nextUrl.pathname === '/' && isLoggedIn) {
        return Response.redirect(new URL('/dashboard/explore', req.nextUrl));
    }
});

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|noise\\.png).*)"],
};
