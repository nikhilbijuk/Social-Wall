/**
 * Centralized Permission Logic for Social Wall V2
 * 
 * Levels:
 * 0 - Open: Anyone can view/post
 * 1 - Verified: Anyone can view, only verified users can post
 * 2 - Admin Broadcast: Anyone can view, only admins can post
 * 3 - Lockdown: Only admins can view/post
 */

export type UserProfile = {
    id: string;
    name: string;
    is_admin: number | boolean;
    is_verified: number | boolean;
    is_trusted?: number | boolean;
    avatar_url?: string | null;
    can_verify: number | boolean;
};

export function canPost(user: UserProfile | null, level: number) {
    const isAdmin = !!user?.is_admin;
    const isVerified = !!user?.is_verified;

    if (level === 0) return true;
    if (level === 1) return isVerified || isAdmin;
    if (level === 2) return isAdmin;
    if (level === 3) return isAdmin;
    return false;
}

export function canView(user: UserProfile | null, level: number) {
    if (level === 3) return !!user?.is_admin;
    return true;
}

export function shouldBlur(post: { is_blur?: number | boolean }, user: UserProfile | null, level?: number) {
    // Basic rules - Broadcast mode allows trusted users to bypass blur
    if (level === 2 && !user?.is_verified && !user?.is_admin && !user?.is_trusted) return true;
    if (!post.is_blur) return false;
    
    // Explicit manual blurring allows ONLY Verified or Admin
    if (user?.is_verified || user?.is_admin) return false;
    return true;
}
