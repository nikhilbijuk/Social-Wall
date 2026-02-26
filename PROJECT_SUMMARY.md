# Social Wall - Full Technical Blueprint (Next.js Edition)

This document contains everything needed to rebuild the **Social Wall** project from scratch.

## 1. Project Overview
A premium, glassmorphism-themed social wall where users can share text, images, and videos. Migrated to **Next.js 16 (App Router)** for enhanced performance, server-side security, and real-time leaderboard features.

---

## 2. Technical Stack
| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Styling** | Tailwind CSS (Premium Glassmorphism Design) |
| **Language** | TypeScript |
| **Database** | Turso (SQLite via `@libsql/client`) |
| **File Storage** | UploadThing |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Auth** | NextAuth.js (Google OAuth) |
| **Deployment** | Vercel |

---

## 3. Core Architecture

### **A. Server Actions (`src/app/actions`)**
- `posts.ts`: Handles secure post creation, including rate limiting (10s) and content filtering. Revalidates the explore page path upon success.

### **B. API Layer (`src/app/api`)**
- `/posts`: GET endpoint for fetching the feed with infinite scroll support.
- `/leaderboard`: Aggregates points from Turso to provide live ranking of members and teams.
- `/uploadthing`: Unified file upload handler.

### **C. UI Components**
- `GlassCard.tsx`: Signature chat-bubble style card with backdrop blur and optimized video/image rendering.
- `Leaderboard.tsx`: Sidebar component for displaying live user and team rankings.

### **D. Global Store (`src/context`)**
- `AppContext.tsx`: Orchestrates the feed state, leaderboard polling, and integrates with Server Actions for posting.

---

## 4. Development & Deployment
- `npm run dev`: Start development server.
- `npm run build`: Generate production build for Vercel.
- Required Environment Variables: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `UPLOADTHING_TOKEN`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.

---

## 5. Deployment Note (Next.js)
The project is built as a standard Next.js application. All source files now reside within the `src/` directory. The legacy `social-wall-next` folder has been removed to simplify the root structure.
