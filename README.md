# Pastebin-Lite

A simple pastebin application that allows users to create and share text pastes with optional expiry constraints.

## Features

- Create text pastes with optional time-to-live (TTL) and view count limits
- Share pastes via unique URLs
- Automatic expiry based on time or view count
- REST API for programmatic access
- Web UI for easy paste creation and viewing

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Persistence**: Neon Postgres (serverless PostgreSQL)
- **Deployment**: Vercel

## Persistence Layer

This application uses **Neon Postgres** as its persistence layer. Neon is a serverless PostgreSQL database that provides:
- Automatic scaling
- Serverless architecture compatible with Vercel
- Connection pooling
- Persistent storage across requests

The database schema includes a single `pastes` table that stores:
- Paste content
- Creation timestamp
- Expiry timestamp (if TTL is set)
- Maximum view count (if set)
- Current view count

## Local Development

### Prerequisites

- Node.js 18+ and npm
- A Neon Postgres database (free tier available at https://neon.tech)

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pastebin-lite
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
DATABASE_URL=your_neon_postgres_connection_string
TEST_MODE=0
```

4. Initialize the database:
The application will automatically create the required table on first run.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running in Test Mode

To enable deterministic time testing (for automated tests):
```env
TEST_MODE=1
```

When `TEST_MODE=1`, the application will use the `x-test-now-ms` header value as the current time for expiry calculations.

## API Routes

### Health Check
- `GET /api/healthz` - Returns service health status

### Pastes
- `POST /api/pastes` - Create a new paste
- `GET /api/pastes/:id` - Fetch a paste (API, counts as a view)
- `GET /p/:id` - View a paste in browser (HTML)

## Deployment

This application is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the `DATABASE_URL` environment variable
4. Deploy

## Important Design Decisions

1. **Database Schema**: Single table design with indexed `id` column for fast lookups
2. **View Counting**: Atomic increment operations to prevent race conditions
3. **Expiry Logic**: Calculated at read-time, with support for test mode time override
4. **ID Generation**: Uses crypto.randomUUID() for secure, unique paste IDs
5. **Error Handling**: Consistent JSON error responses with appropriate HTTP status codes
6. **HTML Safety**: Paste content is escaped to prevent XSS attacks
7. **Connection Pooling**: Uses Neon's serverless driver for optimal connection handling
8. **src Directory Structure**: Uses Next.js src directory pattern for better organization

## Project Structure

```
pastebin-lite/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── healthz/
│   │   │   │   └── route.js
│   │   │   └── pastes/
│   │   │       ├── route.js
│   │   │       └── [id]/
│   │   │           └── route.js
│   │   ├── p/
│   │   │   └── [id]/
│   │   │       ├── page.js
│   │   │       └── not-found.js
│   │   ├── layout.js
│   │   └── page.js
│   └── lib/
│       ├── db.js
│       └── time.js
├── .env.local
├── .env.local.example
├── .gitignore
├── jsconfig.json
├── next.config.js
├── package.json
└── README.md
```

## API Examples

### Create a paste
```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, World!",
    "ttl_seconds": 3600,
    "max_views": 5
  }'
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "http://localhost:3000/p/550e8400-e29b-41d4-a716-446655440000"
}
```

### Fetch a paste
```bash
curl http://localhost:3000/api/pastes/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "content": "Hello, World!",
  "remaining_views": 4,
  "expires_at": "2026-01-29T15:30:00.000Z"
}
```

### Health check
```bash
curl http://localhost:3000/api/healthz
```

Response:
```json
{
  "ok": true
}
```

## Testing

### Test Mode with Deterministic Time

When `TEST_MODE=1` is set, you can control the time for expiry tests:

```bash
# Create a paste that expires in 60 seconds
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content": "Test", "ttl_seconds": 60}'

# Fetch it with a future timestamp (should return 404)
curl -H "x-test-now-ms: $(date -d '+2 minutes' +%s)000" \
  http://localhost:3000/api/pastes/{paste-id}
```

## Troubleshooting

### Module Resolution Issues

If you see errors about module resolution:
- Ensure `jsconfig.json` has the correct path mapping: `"@/*": ["./src/*"]`
- Make sure all files are in the `src/` directory
- Restart your development server

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Check that your Neon project is active
- Test database connectivity manually
