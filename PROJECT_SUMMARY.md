# Social Wall - Full Technical Blueprint

This document contains everything needed to rebuild the **Social Wall** project from scratch.

## 1. Project Overview
A premium, glassmorphism-themed social wall where users can share text, images, and videos. It features real-time-like persistence via Turso and robust file handling via UploadThing.

---

## 2. Technical Stack
| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 (Vite) |
| **Styling** | Tailwind CSS (Premium Glassmorphism Design) |
| **Language** | TypeScript |
| **Database** | Turso (SQLite via `libsql`) |
| **File Storage** | UploadThing |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Deployment** | Vercel (Standard Node.js Serverless Functions) |

---

## 3. Database Schema (`turso_schema.sql`)
The backend uses Turso for a lightweight yet powerful edge database.
```sql
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  content TEXT,
  type TEXT,           -- Always 'update' for social posts
  tag TEXT,            -- e.g., 'Update', 'News'
  file_url TEXT,       -- URL from UploadThing
  media_type TEXT,     -- 'image' or 'video'
  likes_count INTEGER DEFAULT 0,
  thumbs_up_count INTEGER DEFAULT 0,
  timestamp INTEGER    -- Unix timestamp
);
```

---

## 4. Environment Variables (`.env`)
Required for both local development and Vercel:
- `VITE_TURSO_DB_URL`: Turso connection string.
- `VITE_TURSO_AUTH_TOKEN`: Turso access token.
- `UPLOADTHING_TOKEN`: Unified UploadThing API token. (Only this token is required for production in v7+)

---

## 5. Core Project Architecture

### **A. API Layer (`/api`)**
Vercel hosts the UploadThing endpoint.
- **File**: `api/uploadthing.ts`
- **Logic**: Directly exports the result of `createRouteHandler`.
- **CRITICAL**: The route MUST use `export const config = { runtime: "nodejs" };` to ensure compatibility with Vercel's Serverless environment for this specific setup.
- **CRITICAL**: The router logic is inlined in the API file to eliminate any module resolution errors during the Vercel build process.

### **B. Global Context (`src/context`)**
- `AppContext.tsx`: Manages the global state for `posts`, `isLoading`, and `hasMore`. It handles the fetching logic from Turso and the mutation of likes/thumbs-up.

### **C. Main Pages (`src/pages`)**
- **`ExplorePage.tsx`**: The core of the app.
  - **State**: Tracks input text, selected files (images/videos), and upload progress.
  - **Upload Logic**: Uses `useUploadThing` hook to send files to the server.
  - **Infinite Scroll**: Implemented via `IntersectionObserver` looking at a `loadMoreRef` at the bottom of the feed.

### **D. Routes (`src/App.tsx`)**
Uses `react-router-dom` v7. Focuses on a dashboard-style layout:
- `/` redirects to `/dashboard/explore`.
- `/dashboard/explore` loads the main `ExplorePage`.

---

## 6. Key UI Design Rules
- **Background**: Soft cream/beige (`#EFE7DD`) with a subtle radial dot pattern.
- **Post Cards**: `GlassCard.tsx` provides the signature look:
  - White background with high transparency (`bg-white/80`).
  - Backdrop blur (`backdrop-blur-md`).
  - Thin, light borders (`border-white/20`).
  - Smooth scale animations on hover (Framer Motion).
- **Controls**: Clean buttons for Image/Video attachments using Lucide icons. High-contrast "Send" button in WhatsApp-like teal (`#00A884`).

---

## 7. Configuration for Production (Vercel)

### **`vercel.json`**
Essential for SPA routing. The `/api` rewrite is omitted to allow Vercel's native automatic detection.
```json
{
  "rewrites": [
    { "source": "/((?!api/.*).*)", "destination": "/index.html" }
  ]
}
```

---

## 8. Development Commands
- `npm install`: Install dependencies.
- `npm run dev`: Start local dev server (Vite).
- `npm run build`: Build production bundle for Vercel.
- `npx uploadthing dev`: (Optional) Test UploadThing endpoints locally.
- `turso db shell <db-name> < turso_schema.sql`: Sync schema to Turso.
