/**
 * Get the current time in milliseconds
 * Supports test mode with x-test-now-ms header
 */
export function getCurrentTime(request) {
    // Check if TEST_MODE is enabled
    const testMode = process.env.TEST_MODE === '1';

    if (testMode && request) {
        const testNowMs = request.headers.get('x-test-now-ms');
        if (testNowMs) {
            const timestamp = parseInt(testNowMs, 10);
            if (!isNaN(timestamp)) {
                return timestamp;
            }
        }
    }

    return Date.now();
}

/**
 * Check if a paste has expired
 */
export function isPasteExpired(expiresAt, currentTime) {
    if (!expiresAt) return false;
    // Convert BigInt to Number for comparison
    const expiresAtNum = typeof expiresAt === 'bigint' ? Number(expiresAt) : expiresAt;
    return currentTime >= expiresAtNum;
}

/**
 * Check if view limit has been reached
 */
export function isViewLimitReached(maxViews, viewCount) {
    if (!maxViews) return false;
    return viewCount >= maxViews;
}