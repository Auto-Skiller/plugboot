"use client";

import { useState } from "react";
import { Button } from "@/components/core/ui/button";
import {
    Rocket,
    Sparkles,
    Video,
    MoreHorizontal,
    MessageSquare,
    Shield,
    Languages,
    Bot,
    Lightbulb,
    Clock,
    TrendingUp,
    ChevronRight,
    ThumbsUp,
    ThumbsDown
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/core/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/core/ui/popover";
import { Badge } from "@/components/core/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Suggestion {
    id: string;
    type: "timing" | "content" | "trend" | "improvement";
    title: string;
    description: string;
    action?: string;
    priority?: "high" | "medium" | "low";
}

const AI_SUGGESTIONS: Suggestion[] = [
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
];

interface QuickActionsBarProps {
    onStartWizard?: () => void;
    onOpenHookGenerator?: () => void;
    onOpenMediaEditor?: () => void;
    onOpenDarja?: () => void;
    onOpenSafetyChecker?: () => void;
}

/**
 * QuickActionsBar - Horizontal bar with quick-access buttons including AI Tips
 */
export function QuickActionsBar({
    onStartWizard,
    onOpenHookGenerator,
    onOpenMediaEditor,
    onOpenDarja,
    onOpenSafetyChecker,
}: QuickActionsBarProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>(AI_SUGGESTIONS);
    const [isAIOpen, setIsAIOpen] = useState(false);

    const dismissSuggestion = (id: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== id));
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

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-sm"
        >
            {/* Primary CTA: Start Wizard */}
            <Button
                onClick={onStartWizard}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md"
            >
                <Rocket className="h-4 w-4" />
                Start Wizard
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Quick Tool Shortcuts */}
            <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20"
                onClick={onOpenHookGenerator}
            >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Hook Generator</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 dark:hover:bg-purple-900/20"
                onClick={onOpenMediaEditor}
            >
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Media Editor</span>
            </Button>

            {/* AI Tips Popover */}
            <Popover open={isAIOpen} onOpenChange={setIsAIOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "gap-2 relative",
                            isAIOpen && "bg-primary/10 border-primary"
                        )}
                    >
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="hidden sm:inline">AI Tips</span>
                        {suggestions.length > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                            >
                                {suggestions.length}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-3 border-b bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm">AI Suggestions</span>
                            <Badge variant="secondary" className="text-[10px] ml-auto">
                                {suggestions.length} tips
                            </Badge>
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                        {suggestions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No suggestions right now. Keep creating! ✨
                            </p>
                        ) : (
                            suggestions.map((suggestion) => {
                                const Icon = getTypeIcon(suggestion.type);
                                return (
                                    <div
                                        key={suggestion.id}
                                        className="p-3 rounded-lg bg-muted/50 border hover:bg-muted/80 transition-colors"
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className={cn("p-1.5 rounded-md", getTypeColor(suggestion.type))}>
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-xs">{suggestion.title}</p>
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
                                                        onClick={() => dismissSuggestion(suggestion.id)}
                                                        className="p-1 text-muted-foreground hover:text-green-500"
                                                        aria-label="Helpful"
                                                    >
                                                        <ThumbsUp className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => dismissSuggestion(suggestion.id)}
                                                        className="p-1 text-muted-foreground hover:text-red-500"
                                                        aria-label="Not helpful"
                                                    >
                                                        <ThumbsDown className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {/* More Tools Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="hidden sm:inline">More</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={onOpenDarja} className="gap-2">
                        <Languages className="h-4 w-4 text-green-500" />
                        Darja Optimizer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenSafetyChecker} className="gap-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        Safety Checker
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        Brand Voice
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </motion.div>
    );
}

