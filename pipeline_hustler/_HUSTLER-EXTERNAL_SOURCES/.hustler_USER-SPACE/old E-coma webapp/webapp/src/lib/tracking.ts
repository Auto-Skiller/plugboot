// Tracking utility functions for Research Studio
// Manages localStorage-based tracking system for products, ads, topics, and reports

export interface TrackedItem {
    id: string;
    type: 'ad' | 'topic' | 'product' | 'report';
    itemId: number;
    title: string;

    // Tracking settings
    notificationMethods: {
        browser: boolean;
        email: boolean;
    };
    frequency: 'instant' | 'daily' | 'weekly';
    triggers: string[];  // ['price', 'engagement', 'mentions', etc.]

    // Metadata
    dateTracked: string;
    lastNotification?: string;
    isActive: boolean;

    // Alert history
    alerts: Array<{
        date: string;
        type: string;
        message: string;
    }>;
}

const STORAGE_KEY = 'research_tracked_items';

// Get all tracked items from localStorage
export function getTrackedItems(type?: string): TrackedItem[] {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];

        const items: TrackedItem[] = JSON.parse(data);

        if (type) {
            return items.filter(item => item.type === type);
        }

        return items;
    } catch (error) {
        console.error('Error reading tracked items:', error);
        return [];
    }
}

// Add item to tracking
export function trackItem(item: Omit<TrackedItem, 'id' | 'dateTracked' | 'isActive' | 'alerts'>): void {
    if (typeof window === 'undefined') return;

    try {
        const items = getTrackedItems();

        const newItem: TrackedItem = {
            ...item,
            id: `${item.type}-${item.itemId}-${Date.now()}`,
            dateTracked: new Date().toISOString(),
            isActive: true,
            alerts: []
        };

        items.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

        // Show success notification (browser)
        if (item.notificationMethods.browser && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('Tracking Enabled', {
                    body: `Now tracking: ${item.title}`,
                    icon: '/favicon.ico'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
    } catch (error) {
        console.error('Error tracking item:', error);
    }
}

// Remove item from tracking
export function untrackItem(itemId: string): void {
    if (typeof window === 'undefined') return;

    try {
        const items = getTrackedItems();
        const filtered = items.filter(item => item.id !== itemId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error untracking item:', error);
    }
}

// Check if item is tracked
export function isItemTracked(itemId: number, type: string): boolean {
    const items = getTrackedItems(type);
    return items.some(item => item.itemId === itemId);
}

// Update tracking status (pause/resume)
export function updateTrackingStatus(itemId: string, isActive: boolean): void {
    if (typeof window === 'undefined') return;

    try {
        const items = getTrackedItems();
        const updated = items.map(item =>
            item.id === itemId ? { ...item, isActive } : item
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error updating tracking status:', error);
    }
}

// Add alert to tracked item
export function addAlert(itemId: string, alert: { type: string; message: string }): void {
    if (typeof window === 'undefined') return;

    try {
        const items = getTrackedItems();
        const updated = items.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    alerts: [
                        {
                            date: new Date().toISOString(),
                            type: alert.type,
                            message: alert.message
                        },
                        ...item.alerts
                    ].slice(0, 50), // Keep last 50 alerts
                    lastNotification: new Date().toISOString()
                };
            }
            return item;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Error adding alert:', error);
    }
}

// Send notification (mock for MVP - in production this would call backend)
export function sendNotification(item: TrackedItem, alert: { type: string; message: string }): void {
    if (typeof window === 'undefined') return;

    // Browser notification
    if (item.notificationMethods.browser && 'Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification(alert.type, {
                body: alert.message,
                icon: '/favicon.ico'
            });
        }
    }

    // Email notification (mock - would call backend in production)
    if (item.notificationMethods.email) {
        console.log(`[EMAIL] To: user@example.com | Subject: ${alert.type} | Body: ${alert.message}`);
    }

    // Add alert to history
    addAlert(item.id, alert);
}

// Get tracked item by ID
export function getTrackedItem(itemId: string): TrackedItem | undefined {
    return getTrackedItems().find(item => item.id === itemId);
}

// Clear all tracked items (for testing/reset)
export function clearAllTracking(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}
