import { NextResponse } from 'next/server';
import { sql, ensureInitialized } from '@/lib/db';

export async function GET() {
    try {
        // Ensure database is initialized
        await ensureInitialized();

        // Test database connectivity
        await sql`SELECT 1`;

        return NextResponse.json(
            { ok: true },
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        return NextResponse.json(
            { ok: false, error: 'Database connection failed' },
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}