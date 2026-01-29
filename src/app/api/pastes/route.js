import { NextResponse } from 'next/server';
import { sql, ensureInitialized } from '@/lib/db';
import { getCurrentTime } from '@/lib/time';
import { randomUUID } from 'crypto';

export async function POST(request) {
    try {
        // Ensure database is initialized
        await ensureInitialized();

        // Parse request body
        const body = await request.json();
        const { content, ttl_seconds, max_views } = body;

        // Validate content
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'content is required and must be a non-empty string' },
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Validate ttl_seconds if provided
        if (ttl_seconds !== undefined && ttl_seconds !== null) {
            if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
                return NextResponse.json(
                    { error: 'ttl_seconds must be an integer >= 1' },
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }
        }

        // Validate max_views if provided
        if (max_views !== undefined && max_views !== null) {
            if (!Number.isInteger(max_views) || max_views < 1) {
                return NextResponse.json(
                    { error: 'max_views must be an integer >= 1' },
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }
        }

        // Generate unique ID
        const id = randomUUID();

        // Get current time
        const currentTime = getCurrentTime(request);

        // Calculate expiry time if TTL is provided
        const expiresAt = ttl_seconds
            ? currentTime + (ttl_seconds * 1000)
            : null;

        // Insert paste into database
        await sql`
      INSERT INTO pastes (id, content, created_at, expires_at, max_views, view_count)
      VALUES (
        ${id},
        ${content},
        ${currentTime},
        ${expiresAt},
        ${max_views || null},
        0
      )
    `;

        // Get the base URL from the request
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const baseUrl = `${protocol}://${host}`;
        const url = `${baseUrl}/p/${id}`;

        return NextResponse.json(
            { id, url },
            {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error('Error creating paste:', error);

        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}