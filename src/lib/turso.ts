import { createClient } from '@libsql/client';

const url = import.meta.env.VITE_TURSO_DB_URL || 'file:local.db'; // Fallback for dev without remote
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

if (!import.meta.env.VITE_TURSO_DB_URL) {
    console.warn('VITE_TURSO_DB_URL is missing! Using local fallback or failing.');
}

export const turso = createClient({
    url,
    authToken,
});
