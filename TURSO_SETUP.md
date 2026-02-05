# Turso Setup Guide

To get your "Social Wall" working with a real database, follow these steps to set up Turso.

## Option A: Using Turso CLI (Recommended)

1.  **Install Turso CLI** (if you haven't):
    *   Windows: `curl -sSfL https://get.tur.so/install.sh | bash` (requires WSL) OR check [docs](https://docs.turso.tech/cli/installation) for Windows installer.
    *   *Easier alternative*: Sign up at [turso.tech](https://turso.tech) and use the Web Dashboard (Option B).

2.  **Login**:
    ```powershell
    turso auth login
    ```

3.  **Create a Database**:
    ```powershell
    turso db create social-wall-db
    ```

4.  **Get Configuration URL**:
    ```powershell
    turso db show social-wall-db --url
    ```
    *   Copy the URL (e.g., `libsql://social-wall-db-username.turso.io`).

5.  **Get Authentication Token**:
    ```powershell
    turso db tokens create social-wall-db
    ```
    *   Copy the long string token.

6.  **Create Tables**:
    *   Run the schema command directly using the CLI:
    ```powershell
    turso db shell social-wall-db < turso_schema.sql
    ```
    *   *Or manually inside the shell*:
        1.  `turso db shell social-wall-db`
        2.  Paste the contents of `turso_schema.sql`.
        3.  Type `.quit` to exit.

## Option B: Using Turso Website (Easier)

1.  Go to [turso.tech](https://turso.tech) and Sign Up/Login.
2.  Click **"Create Database"**. Name it `social-wall-db`.
3.  Click on the new database.
4.  **Get URL**: Look for the **Database URL** and copy it.
5.  **Get Token**: Click "Create Token" (or "Generate Token") and copy it.
6.  **Run SQL**:
    *   There should be a "SQL Editor" or "Console" tab in the dashboard.
    *   Open `turso_schema.sql` (located in your project folder) in VS Code, copy the content.
    *   Paste it into the Turso SQL Editor and run it.

## Final Step: Connect App

1.  Create a file named `.env` in the root folder (`c:\Users\user56\Social Wall\.env`).
2.  Add your keys:
    ```env
    VITE_TURSO_DB_URL=your_copied_url_here
    VITE_TURSO_AUTH_TOKEN=your_copied_token_here
    ```
3.  Restart your terminal/server (`npm run dev`) if it was running.
