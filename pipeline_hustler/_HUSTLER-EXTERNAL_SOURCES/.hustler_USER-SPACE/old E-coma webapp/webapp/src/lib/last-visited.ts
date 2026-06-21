// ============================================================================
// LAST VISITED PAGE TRACKING
// ============================================================================

const LAST_VISITED_KEY = 'riglify-last-visited-page';
const DEFAULT_PAGE = '/dashboard/analytics';

/**
 * Save the current page to localStorage as last visited
 */
export function saveLastVisitedPage(path: string): void {
    if (typeof window === 'undefined') return;

    // Don't save hub, auth, or api routes
    if (path === '/hub' || path.startsWith('/auth') || path.startsWith('/api')) {
        return;
    }

    try {
        localStorage.setItem(LAST_VISITED_KEY, path);
    } catch (e) {
        console.error('Failed to save last visited page:', e);
    }
}

/**
 * Get the last visited page from localStorage
 */
export function getLastVisitedPage(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        return localStorage.getItem(LAST_VISITED_KEY);
    } catch (e) {
        console.error('Failed to get last visited page:', e);
        return null;
    }
}

/**
 * Clear the last visited page from localStorage
 */
export function clearLastVisitedPage(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(LAST_VISITED_KEY);
    } catch (e) {
        console.error('Failed to clear last visited page:', e);
    }
}

/**
 * Get the default page to redirect to
 */
export function getDefaultPage(): string {
    return DEFAULT_PAGE;
}
