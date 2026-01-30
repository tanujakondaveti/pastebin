import { neon } from '@neondatabase/serverless';

// Get the database connection
const sql = neon(process.env.DATABASE_URL);

// Track initialization state
let initPromise = null;

// Retry configuration
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 500; // initial delay (0.5s)
const MAX_DELAY_MS = 8000; // cap delay

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Initialize database table
async function initDatabase() {
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

  await sql`
    CREATE INDEX IF NOT EXISTS idx_pastes_id ON pastes(id)
  `;
}

// Retry wrapper with exponential backoff
async function initDatabaseWithRetry(
  retries = MAX_RETRIES,
  attempt = 1
) {
  try {
    await initDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    if (attempt > retries) {
      console.error(
        `Database initialization failed after ${retries} retries`,
        error
      );
      throw error;
    }

    // Exponential backoff + jitter
    const delay = Math.min(
      BASE_DELAY_MS * 2 ** (attempt - 1) +
      Math.floor(Math.random() * 300),
      MAX_DELAY_MS
    );

    console.warn(
      `DB init failed (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`
    );

    await sleep(delay);
    return initDatabaseWithRetry(retries, attempt + 1);
  }
}

// Ensure database is initialized before any query
async function ensureInitialized() {
  if (!initPromise) {
    initPromise = initDatabaseWithRetry();
  }
  await initPromise;
}

// Start initialization eagerly
ensureInitialized();

export { sql, ensureInitialized };
