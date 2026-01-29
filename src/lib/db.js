import { neon } from '@neondatabase/serverless';

// Get the database connection
const sql = neon(process.env.DATABASE_URL);

// Track initialization state
let initPromise = null;

// Initialize database table
async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS pastes (
        id VARCHAR(255) PRIMARY KEY,
        content TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        expires_at BIGINT,
        max_views INTEGER,
        view_count INTEGER DEFAULT 0
      )
    `;

    // Create index on id column
    await sql`
      CREATE INDEX IF NOT EXISTS idx_pastes_id ON pastes(id)
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Ensure database is initialized before any query
async function ensureInitialized() {
  if (!initPromise) {
    initPromise = initDatabase();
  }
  await initPromise;
}

// Start initialization
ensureInitialized();

export { sql, ensureInitialized };