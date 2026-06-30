"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/core/ui/button";
import {
    Dialog,
    DialogContent,
} from "@/components/core/ui/dialog";
import { Input } from "@/components/core/ui/input";
import {
    Rocket,
    MessageSquare,
    Video,
    Languages,
    Shield,
    Palette,
    Image,
    Plus,
    Calendar,
    FileText,
    Settings,
    HelpCircle,
    Lightbulb,
    LayoutTemplate,
    Bot,
    Search,
    Command
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandAction {
    id: string;
    label: string;
    shortcut?: string;
    icon: React.ElementType;
    category: "create" | "tools" | "navigation" | "help";
    action: () => void;
}

interface CommandPaletteProps {
    onStartWizard?: () => void;
    onOpenTool?: (toolId: string) => void;
    onOpenTemplates?: () => void;
}

/**
 * CommandPalette - Power-user keyboard navigation (⌘K or Ctrl+K)
 */
export function CommandPalette({
    onStartWizard,
    onOpenTool,
    onOpenTemplates
}: CommandPaletteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const commands: CommandAction[] = useMemo(() => [
        // Create actions
        { id: "wizard", label: "Start Creation Wizard", shortcut: "W", icon: Rocket, category: "create", action: () => { onStartWizard?.(); setIsOpen(false); } },
        { id: "new-idea", label: "New Content Idea", shortcut: "N", icon: Plus, category: "create", action: () => setIsOpen(false) },
        { id: "templates", label: "Browse Templates", shortcut: "T", icon: LayoutTemplate, category: "create", action: () => { onOpenTemplates?.(); setIsOpen(false); } },
        { id: "schedule", label: "Schedule Post", shortcut: "S", icon: Calendar, category: "create", action: () => setIsOpen(false) },
        // Tools
        { id: "hook-generator", label: "Hook Generator", icon: MessageSquare, category: "tools", action: () => { onOpenTool?.("hook-generator"); setIsOpen(false); } },
        { id: "media-editor", label: "AI Media Editor", icon: Video, category: "tools", action: () => { onOpenTool?.("media-editor"); setIsOpen(false); } },
        { id: "darja", label: "Darja Optimizer", icon: Languages, category: "tools", action: () => { onOpenTool?.("darja"); setIsOpen(false); } },
        { id: "safety", label: "Content Safety Checker", icon: Shield, category: "tools", action: () => { onOpenTool?.("safety"); setIsOpen(false); } },
        { id: "brand-voice", label: "Brand Voice Profile", icon: Palette, category: "tools", action: () => { onOpenTool?.("brand-voice"); setIsOpen(false); } },
        { id: "formats", label: "Format Presets", icon: Image, category: "tools", action: () => { onOpenTool?.("formats"); setIsOpen(false); } },
        // Navigation
        { id: "ideas", label: "View Ideas", icon: Lightbulb, category: "navigation", action: () => setIsOpen(false) },
        { id: "drafts", label: "View Drafts", icon: FileText, category: "navigation", action: () => setIsOpen(false) },
        { id: "settings", label: "Settings", icon: Settings, category: "navigation", action: () => setIsOpen(false) },
        // Help
        { id: "help", label: "Help & Documentation", shortcut: "?", icon: HelpCircle, category: "help", action: () => setIsOpen(false) },
        { id: "ai-copilot", label: "Ask AI Copilot", icon: Bot, category: "help", action: () => setIsOpen(false) },
    ], [onStartWizard, onOpenTool, onOpenTemplates]);

    const filteredCommands = useMemo(() => {
        if (!search) return commands;
        const lower = search.toLowerCase();
        return commands.filter(cmd =>
            cmd.label.toLowerCase().includes(lower) ||
            cmd.category.includes(lower)
        );
    }, [commands, search]);

    const categories = { create: "Create", tools: "Tools", navigation: "Navigate", help: "Help" };

    const handleClose = () => {
        setIsOpen(false);
        setSearch("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="p-0 max-w-lg overflow-hidden gap-0">
                {/* Search Input */}
                <div className="flex items-center border-b px-3">
                    <Search className="h-4 w-4 text-muted-foreground mr-2" />
                    <Input
                        placeholder="Type a command or search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-0 focus-visible:ring-0 px-0"
                        autoFocus
                    />
                    <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded ml-2">ESC</kbd>
                </div>

                {/* Command List */}
                <div className="max-h-80 overflow-y-auto p-2">
                    {filteredCommands.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-6">No results found.</p>
                    )}

                    {(Object.keys(categories) as Array<keyof typeof categories>).map(cat => {
                        const catCommands = filteredCommands.filter(c => c.category === cat);
                        if (catCommands.length === 0) return null;

                        return (
                            <div key={cat} className="mb-2">
                                <p className="text-xs font-medium text-muted-foreground px-2 py-1">{categories[cat]}</p>
                                {catCommands.map(cmd => (
                                    <button
                                        key={cmd.id}
                                        onClick={cmd.action}
                                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                                    >
                                        <cmd.icon className="h-4 w-4 text-muted-foreground" />
                                        <span className="flex-1 text-sm">{cmd.label}</span>
                                        {cmd.shortcut && (
                                            <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{cmd.shortcut}</kbd>
                                        )}
                                    </button>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Hint */}
                <div className="border-t px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Command className="h-3 w-3" />
                        <span>Press <kbd className="bg-muted px-1 rounded">↑↓</kbd> to navigate</span>
                    </div>
                    <span>Press <kbd className="bg-muted px-1 rounded">Enter</kbd> to select</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
