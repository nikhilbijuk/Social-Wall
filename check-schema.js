const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let dbUrl, token;
env.split('\n').forEach(line => {
    if (line.startsWith('TURSO_DATABASE_URL=')) dbUrl = line.split('=')[1].trim();
    if (line.startsWith('TURSO_AUTH_TOKEN=')) token = line.split('=')[1].trim();
});

const { createClient } = require('@libsql/client');
const db = createClient({ url: dbUrl, authToken: token });

async function check() {
    const res = await db.execute("SELECT sql FROM sqlite_schema WHERE type='table' AND name IN ('users', 'posts');");
    console.log(res.rows.map(r => r.sql).join('\n\n'));
}
check();
