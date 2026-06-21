"use client";

import * as React from "react";
import { X, Settings, Power, MessageSquare, Target, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMode } from "./ModeContext";
import { TEAMS } from "@/config/teams";
import { Switch } from "@/components/core/ui/switch";
import { Input } from "@/components/core/ui/input";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";


interface TeamConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TeamConfigModal({ isOpen, onClose }: TeamConfigModalProps) {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const { activeTeams, setTeamActive, teamObjectives, setTeamObjective } = useMode();
    const [editingObjective, setEditingObjective] = React.useState<string | null>(null);
    const [objectiveInput, setObjectiveInput] = React.useState("");

    // Close on Escape
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    const handleSaveObjective = (teamId: string) => {
        setTeamObjective(teamId, objectiveInput);
        setEditingObjective(null);
        setObjectiveInput("");
    };

    const startEditingObjective = (teamId: string) => {
        setEditingObjective(teamId);
        setObjectiveInput(teamObjectives[teamId] || "");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className={cn(
                    "relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                    "flex flex-col max-h-[85vh]"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Settings className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Team Configuration</h2>
                            <p className="text-sm text-muted-foreground">Manage team access and objectives</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="space-y-4 p-6">
                        {TEAMS.map((team) => {
                            const isActive = activeTeams.some(t => t.id === team.id);
                            const Icon = team.icon;

                            return (
                                <div
                                    key={team.id}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all",
                                        isActive
                                            ? "border-primary/30 bg-primary/5"
                                            : "border-border bg-muted/20 opacity-60"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Team Icon */}
                                        <div className={cn(
                                            "flex items-center justify-center w-12 h-12 rounded-xl border shrink-0",
                                            isActive ? "bg-card border-border" : "bg-muted border-border/50"
                                        )}>
                                            <Icon className={cn("h-6 w-6", team.color)} />
                                        </div>

                                        {/* Team Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{team.name}</h3>
                                                    {isActive && (
                                                        <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Switch
                                                    checked={isActive}
                                                    onCheckedChange={(checked) => setTeamActive(team.id, checked)}
                                                />
                                            </div>

                                            {/* Page Access */}
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                                <span>Page:</span>
                                                <code className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">
                                                    {team.allowedPage}
                                                </code>
                                            </div>

                                            {/* Objective */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                    <Target className="w-3 h-3" />
                                                    Current Objective
                                                </div>

                                                {editingObjective === team.id ? (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={objectiveInput}
                                                            onChange={(e) => setObjectiveInput(e.target.value)}
                                                            placeholder="Enter objective..."
                                                            className="h-8 text-sm"
                                                            autoFocus
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-3"
                                                            onClick={() => handleSaveObjective(team.id)}
                                                        >
                                                            <Check className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 px-3"
                                                            onClick={() => setEditingObjective(null)}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEditingObjective(team.id)}
                                                        className="text-sm text-left hover:text-primary transition-colors w-full p-2 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border"
                                                    >
                                                        {teamObjectives[team.id] || "Click to set objective..."}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-muted/30 border-t border-border text-xs text-muted-foreground flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        <span>{activeTeams.length} of {TEAMS.length} teams active</span>
                    </div>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">esc</kbd> to close
                    </span>
                </div>
            </div>
        </div>
    );
}
