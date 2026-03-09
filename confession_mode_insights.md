# Insights: Safe Confession Mode (Verified Only)

Confession Mode is designed to be a "Secret Wall" within the Social Wall—a space for raw, anonymous sharing that maintains high standards of accountability through verification.

## 🛡️ The "Accountable Anonymity" Model

Standard anonymous apps (like YikYak or Sarahah) often fail due to unchecked toxicity. Our model solves this by requiring **Identity Verification** before a user can post a confession.

- **Verified Participation**: Only users with `is_verified = 1` can toggle this mode.
- **Traceable Anonymity**: To the public, the post is anonymous. In the database, the `author_id` is still stored. 
- **The "Reveal" Mechanism**: Admins have an override tool to reveal an author *if and only if* a post is reported for harassment or legal violations.

## 🎨 Visual Identity: The "Secret Wall"

When a user toggles Confession Mode, the UI should undergo a physical "shift" to signal they are in a different space.

- **The Flip**: A 3D card flip animation for the entire wall or a smooth cross-fade to a dark/neon-purple theme.
- **Glassmorphism**: Use deep purple blurs (`backdrop-blur-xl`) with subtle moving gradients in the background to create a "night-time" feel.
- **The Badge**: Confession cards don't show names or avatars; they show a generic "🎭 Secret Confession" label with a distinct border glow.

## ⚙️ Technical Architecture

### 1. Database Schema Extensions
Instead of a separate table, we move `is_confession` into the `posts` table to keep queries fast.
```sql
ALTER TABLE posts ADD COLUMN is_confession INTEGER DEFAULT 0;
```

### 2. Logic Flow
1. **Frontend**: User toggles "Secret Mode". The app checks `userProfile.is_verified`. If not verified, it triggers the Verification Modal instead.
2. **API Layer**: `POST /api/posts` accepts an `is_confession` flag. The server verifies the user's session and verification status before allowing the flag.
3. **Streaming**: The SSE stream broadcasts the flag. `AppContext` receives the post and `GlassCard` decides what to mask.

## ⚖️ Moderation Strategy

- **Keyword Auto-Nuke**: Real-time AI filtering (e.g., Perspective API) to block toxic confessions before they land.
- **Verification Penalty**: If a verified user abuses Confession Mode, their "Verified" status is revoked globally, acting as a powerful deterrent.
- **Shadow Banning**: Toxic users can be shadow-banned from the Confession stream specifically while remaining on the main wall.

## 🚀 Engagement Mechanics: "The Whisper Effect"
Confessions could have a unique "Whisper" reaction (a specific muted emoji burst) to distinguish them from standard posts, encouraging a more empathetic or secretive interaction style.
