"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import {
    Bot,
    X,
    Lightbulb,
    Clock,
    TrendingUp,
    Sparkles,
    ChevronRight,
    ThumbsUp,
    ThumbsDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
    id: string;
    type: "timing" | "content" | "trend" | "improvement";
    title: string;
    description: string;
    action?: string;
    priority?: "high" | "medium" | "low";
}

const MOCK_SUGGESTIONS: Suggestion[] = [
    {
        id: "1",
        type: "timing",
        title: "Optimal Post Time",
        description: "Posts published between 9-11 AM get 23% more engagement in Algeria!",
        action: "Schedule for 10 AM",
        priority: "high"
    },
    {
        id: "2",
        type: "trend",
        title: "Trending Hashtag",
        description: "#AlgeriaVibes is trending. Add it to your next post for more reach.",
        action: "Add Hashtag",
        priority: "medium"
    },
    {
        id: "3",
        type: "content",
        title: "Content Idea",
        description: "Your audience engages more with product unboxing videos. Consider creating one!",
        action: "Create Video",
        priority: "medium"
    },
    {
        id: "4",
        type: "improvement",
        title: "Hook Improvement",
        description: "Add urgency words like 'Now' or 'Limited' to increase click-through by 15%.",
        action: "Apply Tip",
        priority: "low"
    }
];

interface AICopilotProps {
    isOpen?: boolean;
    onToggle?: () => void;
    className?: string;
}

/**
 * AICopilot - AI suggestions panel that provides contextual recommendations
 */
export function AICopilot({ isOpen = false, onToggle, className }: AICopilotProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const [isMinimized, setIsMinimized] = useState(!isOpen);

    useEffect(() => {
        // Simulate loading suggestions
        const timer = setTimeout(() => {
            setSuggestions(MOCK_SUGGESTIONS);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const visibleSuggestions = suggestions.filter(s => !dismissedIds.has(s.id));

    const dismissSuggestion = (id: string) => {
        setDismissedIds(prev => new Set([...prev, id]));
    };

    const handleFeedback = (id: string, positive: boolean) => {
        // In production, send feedback to API
        console.log(`Feedback for ${id}: ${positive ? "positive" : "negative"}`);
        dismissSuggestion(id);
    };

    const getTypeIcon = (type: Suggestion["type"]) => {
        switch (type) {
            case "timing": return Clock;
            case "trend": return TrendingUp;
            case "content": return Lightbulb;
            case "improvement": return Sparkles;
        }
    };

    const getTypeColor = (type: Suggestion["type"]) => {
        switch (type) {
            case "timing": return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
            case "trend": return "text-green-500 bg-green-100 dark:bg-green-900/30";
            case "content": return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
            case "improvement": return "text-purple-500 bg-purple-100 dark:bg-purple-900/30";
        }
    };

    const getPriorityColor = (priority?: Suggestion["priority"]) => {
        switch (priority) {
            case "high": return "bg-red-500";
            case "medium": return "bg-yellow-500";
            case "low": return "bg-green-500";
            default: return "bg-gray-500";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("fixed bottom-20 right-4 z-50", className)}
        >
            <AnimatePresence mode="wait">
                {isMinimized ? (
                    /* Minimized bubble */
                    <motion.button
                        key="bubble"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setIsMinimized(false)}
                        className="relative p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow"
                        aria-label="Open AI Copilot"
                    >
                        <Bot className="h-6 w-6" />
                        {visibleSuggestions.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {visibleSuggestions.length}
                            </span>
                        )}
                    </motion.button>
                ) : (
                    /* Expanded panel */
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    >
                        <Card className="w-80 shadow-2xl border-primary/20">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-primary/10 rounded-lg">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <CardTitle className="text-sm">AI Copilot</CardTitle>
                                        <Badge variant="secondary" className="text-[10px]">
                                            {visibleSuggestions.length} tips
                                        </Badge>
                                    </div>
                                    <button
                                        onClick={() => setIsMinimized(true)}
                                        className="p-1 text-muted-foreground hover:text-foreground"
                                        aria-label="Minimize AI Copilot"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                                {visibleSuggestions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No suggestions right now. Keep creating! ✨
                                    </p>
                                ) : (
                                    visibleSuggestions.map((suggestion) => {
                                        const Icon = getTypeIcon(suggestion.type);
                                        return (
                                            <motion.div
                                                key={suggestion.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="p-3 rounded-lg bg-muted/50 border hover:bg-muted/80 transition-colors"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className={cn("p-1.5 rounded-md", getTypeColor(suggestion.type))}>
                                                        <Icon className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-medium text-xs">{suggestion.title}</p>
                                                            {suggestion.priority && (
                                                                <span className={cn(
                                                                    "w-1.5 h-1.5 rounded-full",
                                                                    getPriorityColor(suggestion.priority)
                                                                )} />
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                                            {suggestion.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {suggestion.action && (
                                                                <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1">
                                                                    {suggestion.action}
                                                                    <ChevronRight className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                            <div className="flex-1" />
                                                            <button
                                                                onClick={() => handleFeedback(suggestion.id, true)}
                                                                className="p-1 text-muted-foreground hover:text-green-500"
                                                                aria-label="Helpful"
                                                            >
                                                                <ThumbsUp className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleFeedback(suggestion.id, false)}
                                                                className="p-1 text-muted-foreground hover:text-red-500"
                                                                aria-label="Not helpful"
                                                            >
                                                                <ThumbsDown className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
