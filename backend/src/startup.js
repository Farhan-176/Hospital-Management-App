/**
 * Production startup script
 * Runs migrate → seed → server in sequence
 * Used by: npm run start:prod (Render deployment)
 */
const migrate = require('./config/migrate');
const seed = require('./config/seed');

const startup = async () => {
    console.log('🚀 Starting production server...\n');

    // Step 1: Run migrations (uses `alter` in production — no data loss)
    console.log('📦 Step 1/3 — Running database migrations...');
    await migrate();

    // Step 2: Seed demo data (idempotent — skips existing records)
    console.log('\n🌱 Step 2/3 — Seeding database...');
    await seed();

    // Step 3: Start the Express server
    console.log('\n⚡ Step 3/3 — Starting Express server...');
    require('./server');
};

startup().catch((err) => {
    console.error('❌ Startup failed:', err);
    process.exit(1);
});
