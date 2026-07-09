export interface AISuggestion {
    id: string;
    type: "timing" | "content" | "trend" | "improvement";
    title: string;
    description: string;
    action?: string;
    priority?: "high" | "medium" | "low";
}
