import { sql, ensureInitialized } from '@/lib/db';
import { isPasteExpired, isViewLimitReached } from '@/lib/time';
import { notFound } from 'next/navigation';

// Helper to escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

export default async function ViewPastePage({ params }) {
    // In Next.js 14+ App Router, params is a promise that needs to be awaited
    const { id } = await params;

    try {
        // Ensure database is initialized
        await ensureInitialized();

        // Fetch the paste from database
        const result = await sql`
      SELECT * FROM pastes WHERE id = ${id}
    `;

        if (result.length === 0) {
            notFound();
        }

        const paste = result[0];
        const currentTime = Date.now(); // Always use real time for HTML view

        // Check if paste has expired
        if (isPasteExpired(paste.expires_at, currentTime)) {
            notFound();
        }

        // Check if view limit has been reached (before incrementing)
        if (isViewLimitReached(paste.max_views, paste.view_count)) {
            notFound();
        }

        // Increment view count
        await sql`
      UPDATE pastes 
      SET view_count = view_count + 1 
      WHERE id = ${id}
    `;

        // Escape content to prevent XSS
        const safeContent = escapeHtml(paste.content);

        // Calculate remaining info
        const remainingViews = paste.max_views
            ? paste.max_views - paste.view_count - 1
            : null;

        // Convert expires_at from BigInt to Date properly
        const expiresAt = paste.expires_at
            ? new Date(Number(paste.expires_at)).toLocaleString()
            : null;

        return (
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '20px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h1 style={{ margin: 0 }}>Paste</h1>
                    <a
                        href="/"
                        style={{
                            textDecoration: 'none',
                            color: '#0070f3',
                            fontSize: '14px'
                        }}
                    >
                        Create New Paste
                    </a>
                </div>

                {(remainingViews !== null || expiresAt) && (
                    <div style={{
                        background: '#f5f5f5',
                        padding: '10px 15px',
                        borderRadius: '5px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        {remainingViews !== null && (
                            <div>Remaining views: {remainingViews}</div>
                        )}
                        {expiresAt && (
                            <div>Expires at: {expiresAt}</div>
                        )}
                    </div>
                )}

                <div style={{
                    background: '#fafafa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '5px',
                    padding: '15px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.5'
                }}>
                    <div dangerouslySetInnerHTML={{ __html: safeContent }} />
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error viewing paste:', error);
        notFound();
    }
}

// Make this page dynamic
export const dynamic = 'force-dynamic';