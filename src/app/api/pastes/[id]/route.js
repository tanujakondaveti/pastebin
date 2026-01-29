import { NextResponse } from 'next/server';
import { sql, ensureInitialized } from '@/lib/db';
import { getCurrentTime, isPasteExpired, isViewLimitReached } from '@/lib/time';

export async function GET(request, { params }) {
    try {
        // Ensure database is initialized
        await ensureInitialized();

        // In Next.js 14+ App Router, params is a promise that needs to be awaited
        const { id } = await params;

        // Fetch the paste from database
        const result = await sql`
      SELECT * FROM pastes WHERE id = ${id}
    `;

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Paste not found' },
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const paste = result[0];
        const currentTime = getCurrentTime(request);

        // Check if paste has expired
        if (isPasteExpired(paste.expires_at, currentTime)) {
            return NextResponse.json(
                { error: 'Paste has expired' },
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Check if view limit has been reached (before incrementing)
        if (isViewLimitReached(paste.max_views, paste.view_count)) {
            return NextResponse.json(
                { error: 'Paste view limit exceeded' },
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Increment view count
        await sql`
      UPDATE pastes 
      SET view_count = view_count + 1 
      WHERE id = ${id}
    `;

        // Calculate remaining views
        const remainingViews = paste.max_views
            ? paste.max_views - paste.view_count - 1
            : null;

        // Format expires_at as ISO string if it exists - convert BigInt to Number first
        const expiresAt = paste.expires_at
            ? new Date(Number(paste.expires_at)).toISOString()
            : null;

        return NextResponse.json(
            {
                content: paste.content,
                remaining_views: remainingViews,
                expires_at: expiresAt,
            },
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching paste:', error);
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