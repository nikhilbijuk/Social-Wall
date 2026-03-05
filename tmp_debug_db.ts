import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    try {
        // Dynamically import db after env is loaded
        const { db } = await import('./src/lib/db');

        const users = await db.execute('SELECT id, name, is_admin, hearts, thumbs, posts FROM users LIMIT 10');
        console.log('--- Users Data ---');
        console.log(JSON.stringify(users.rows, null, 2));

        const leaderboard = await db.execute('SELECT * FROM leaderboard');
        console.log('\n--- Leaderboard View ---');
        console.log(JSON.stringify(leaderboard.rows, null, 2));

        const platform = await db.execute('SELECT * FROM platform_state');
        console.log('\n--- Platform State ---');
        console.log(JSON.stringify(platform.rows, null, 2));

        const reactions = await db.execute('SELECT count(*) as count FROM reactions');
        console.log('\n--- Reactions Count ---');
        console.log(JSON.stringify(reactions.rows, null, 2));

        const postsCount = await db.execute('SELECT count(*) as count FROM posts');
        console.log('\n--- Posts Count ---');
        console.log(JSON.stringify(postsCount.rows, null, 2));

        const postSchema = await db.execute('PRAGMA table_info(posts)');
        console.log('\n--- Posts Schema ---');
        console.log(JSON.stringify(postSchema.rows, null, 2));

        const samplePosts = await db.execute('SELECT id, user_id, likes_count, thumbs_up_count FROM posts LIMIT 5');
        console.log('\n--- Sample Posts ---');
        console.log(JSON.stringify(samplePosts.rows, null, 2));

    } catch (e) {
        console.error('Debug script error:', e);
    }
}

run();
