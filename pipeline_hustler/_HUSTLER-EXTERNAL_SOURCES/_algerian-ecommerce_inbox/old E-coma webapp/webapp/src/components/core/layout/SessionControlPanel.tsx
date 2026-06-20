"use client";

import { useState } from "react";
import {
    Target,
    Users,
    Send,
    CheckSquare,
    Shield,
    Plus,
    Clock,
    CheckCircle2,
    Circle,
    MessageSquare,
    LayoutGrid,
    Settings,
    Activity,
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Badge } from "@/components/core/ui/badge";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/core/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/core/ui/popover";
import { Switch } from "@/components/core/ui/switch";
import { useMode } from "./ModeContext";
import { TEAMS, Team } from "@/config/teams";

// Tab types for each mode
type AdminTab = "teams" | "todos" | "chat";
type TeamTab = "session" | "todos" | "chat";

export function SessionModuleContent() {
    const {
        mode,
        isAdmin,
        activeTeam,
        activeTeams,
        teamObjectives,
        setTeamObjective,
        adminTodos,
        teamTodos,
        addTodo,
        toggleTodo,
        adminChats,
        teamChats,
        sendMessage,
        setTeamActive
    } = useMode();

    // Tab state
    const [adminTab, setAdminTab] = useState<AdminTab>("teams");
    const [teamTab, setTeamTab] = useState<TeamTab>("session");

    // Form state
    const [newTodo, setNewTodo] = useState("");
    const [chatMessage, setChatMessage] = useState("");
    const [broadcastMsg, setBroadcastMsg] = useState("");

    // Admin filters
    const [adminTodoFilter, setAdminTodoFilter] = useState<'all' | 'admin'>('all');
    const [showTeamChats, setShowTeamChats] = useState(false);

    // Mock workers for display
    const workers = [
        { id: '1', name: 'Sarah Connor', role: 'Confirmation', teamId: 'confirmation', status: 'online' as const },
        { id: '2', name: 'John Doe', role: 'Sourcing', teamId: 'sourcing', status: 'busy' as const },
        { id: '3', name: 'Mike Ross', role: 'Stock', teamId: 'stock', status: 'offline' as const },
    ];

    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim()) return;
        addTodo(newTodo, isAdmin ? 'admin' : 'team');
        setNewTodo("");
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        sendMessage(chatMessage, isAdmin ? 'admin' : 'team');
        setChatMessage("");
    };

    const handleBroadcast = (e: React.FormEvent) => {
        e.preventDefault();
        if (!broadcastMsg.trim()) return;
        sendMessage(broadcastMsg, 'admin');
        setBroadcastMsg("");
    };

    // Get current team's objective
    const currentObjective = activeTeam ? teamObjectives[activeTeam.id] : "No objective set";

    return (
        <div className="flex flex-col h-full bg-transparent">
            {isAdmin ? (
                // ============ ADMIN VIEW ============
                <div className="flex flex-col h-full">
                    {/* Tab Navigation */}
                    <div className="flex gap-1 p-1 bg-muted/30 rounded-lg mb-4">
                        <button
                            onClick={() => setAdminTab("teams")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                                adminTab === "teams"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            Teams Overview
                        </button>
                        <button
                            onClick={() => setAdminTab("todos")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                                adminTab === "todos"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Admin Todos
                            {adminTodos.filter(t => !t.completed).length > 0 && (
                                <Badge variant="secondary" className="text-[9px] h-4 px-1">
                                    {adminTodos.filter(t => !t.completed).length}
                                </Badge>
                            )}
                        </button>
                        <button
                            onClick={() => setAdminTab("chat")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                                adminTab === "chat"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Communications
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden">
                        {adminTab === "teams" && (
                            <div className="h-full flex flex-col">
                                <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" />
                                    All Teams Config
                                </div>
                                <ScrollArea className="flex-1">
                                    <div className="space-y-3 pr-2">
                                        {TEAMS.map(team => {
                                            const Icon = team.icon;
                                            const isActive = activeTeams.some(t => t.id === team.id);
                                            const teamWorkers = workers.filter(w => w.teamId === team.id);

                                            return (
                                                <div key={team.id} className={cn(
                                                    "p-3 rounded-lg border transition-all",
                                                    isActive
                                                        ? "border-primary/20 bg-primary/5 shadow-sm"
                                                        : "border-border bg-card/50 opacity-70 hover:opacity-100"
                                                )}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                                                isActive ? "bg-background shadow-sm" : "bg-muted"
                                                            )}>
                                                                <Icon className={cn("w-4 h-4", isActive ? team.color : "text-muted-foreground")} />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-sm flex items-center gap-2">
                                                                    {team.name}
                                                                    {isActive && (
                                                                        <span className="relative flex h-2 w-2">
                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                                    {teamObjectives[team.id] || "No objective set"}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Configuration Popover */}
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-muted">
                                                                    <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-72" align="end">
                                                                <div className="space-y-4">
                                                                    <div className="font-medium text-sm border-b pb-2">
                                                                        {team.name} Settings
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <div className="space-y-0.5">
                                                                            <Label className="text-xs">Access Status</Label>
                                                                            <div className="text-[10px] text-muted-foreground">
                                                                                {isActive ? "Team can access platform" : "Access locked"}
                                                                            </div>
                                                                        </div>
                                                                        <Switch
                                                                            checked={isActive}
                                                                            onCheckedChange={(checked) => setTeamActive(team.id, checked)}
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label className="text-xs">Current Objective</Label>
                                                                        <div className="flex gap-2">
                                                                            <Input
                                                                                className="h-7 text-xs"
                                                                                placeholder="Set team goal..."
                                                                                defaultValue={teamObjectives[team.id] || ""}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        setTeamObjective(team.id, (e.target as HTMLInputElement).value);
                                                                                        (e.target as HTMLInputElement).blur();
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <p className="text-[10px] text-muted-foreground">Press Enter to save</p>
                                                                    </div>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>

                                                    {isActive && teamWorkers.length > 0 && (
                                                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/10">
                                                            {teamWorkers.map(w => (
                                                                <Avatar key={w.id} className="w-5 h-5">
                                                                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                                                        {w.name.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ))}
                                                            <span className="text-[10px] text-muted-foreground ml-1">
                                                                {teamWorkers.length} active
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

                        {adminTab === "todos" && (
                            <div className="h-full flex flex-col border border-border rounded-xl bg-card overflow-hidden">
                                <div className="p-3 px-4 border-b border-border bg-muted/30 flex items-center justify-between">
                                    <h4 className="text-xs font-semibold flex items-center gap-2">
                                        <CheckSquare className="w-3.5 h-3.5" />
                                        Task Management
                                    </h4>
                                    <div className="flex gap-1">
                                        <Button
                                            variant={adminTodoFilter === 'all' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            className="h-6 text-[10px] px-2"
                                            onClick={() => setAdminTodoFilter('all')}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            variant={adminTodoFilter === 'admin' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            className="h-6 text-[10px] px-2"
                                            onClick={() => setAdminTodoFilter('admin')}
                                        >
                                            My Tasks
                                        </Button>
                                    </div>
                                </div>
                                <ScrollArea className="flex-1 p-2">
                                    <div className="space-y-4">
                                        {/* Admin Todos */}
                                        {(adminTodoFilter === 'all' || adminTodoFilter === 'admin') && (
                                            <div className="space-y-1">
                                                <div className="px-2 text-[10px] font-semibold text-muted-foreground uppercase opacity-70">My Tasks</div>
                                                {adminTodos.map(todo => (
                                                    <div
                                                        key={todo.id}
                                                        className={cn(
                                                            "group flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer",
                                                            todo.completed && "opacity-60"
                                                        )}
                                                        onClick={() => toggleTodo(todo.id)}
                                                    >
                                                        <button className={cn(
                                                            "mt-0.5 shrink-0 transition-colors",
                                                            todo.completed ? "text-green-500" : "text-muted-foreground group-hover:text-primary"
                                                        )}>
                                                            {todo.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                        </button>
                                                        <p className={cn(
                                                            "text-sm leading-snug",
                                                            todo.completed && "line-through text-muted-foreground"
                                                        )}>
                                                            {todo.text}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Team Todos Section */}
                                        {adminTodoFilter === 'all' && teamTodos.length > 0 && (
                                            <div className="space-y-1 pt-2 border-t border-dashed">
                                                <div className="px-2 text-[10px] font-semibold text-muted-foreground uppercase opacity-70 mt-2">Team Tasks</div>
                                                {teamTodos.map(todo => {
                                                    const team = todo.teamId ? TEAMS.find(t => t.id === todo.teamId) : null;
                                                    return (
                                                        <div
                                                            key={todo.id}
                                                            className={cn(
                                                                "group flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer",
                                                                todo.completed && "opacity-60"
                                                            )}
                                                            onClick={() => toggleTodo(todo.id)}
                                                        >
                                                            <button className={cn(
                                                                "mt-0.5 shrink-0 transition-colors",
                                                                todo.completed ? "text-green-500" : "text-muted-foreground group-hover:text-primary"
                                                            )}>
                                                                {todo.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                            </button>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={cn(
                                                                    "text-sm leading-snug",
                                                                    todo.completed && "line-through text-muted-foreground"
                                                                )}>
                                                                    {todo.text}
                                                                </p>
                                                                {team && (
                                                                    <div className="flex items-center gap-1 mt-1">
                                                                        <Badge variant="outline" className="text-[9px] px-1 h-3 border-muted-foreground/20 text-muted-foreground">
                                                                            {team.name}
                                                                        </Badge>
                                                                        {todo.type === 'admin' && (
                                                                            <span className="text-[9px] text-orange-500 flex items-center gap-0.5">
                                                                                <Shield className="w-2 h-2" /> Assigned
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                                <div className="p-3 border-t border-border">
                                    <form onSubmit={handleAddTodo} className="flex gap-2">
                                        <Input
                                            placeholder="Add admin task..."
                                            value={newTodo}
                                            onChange={e => setNewTodo(e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                        <Button size="sm" type="submit" className="h-8 px-3">
                                            <Plus className="w-3.5 h-3.5" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {adminTab === "chat" && (
                            <div className="h-full flex flex-col border border-border rounded-xl bg-card overflow-hidden">
                                <div className="p-3 px-4 border-b border-border bg-muted/30 flex items-center justify-between">
                                    <h4 className="text-xs font-semibold flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        Communications
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-[10px] text-muted-foreground">Monitor Teams</Label>
                                        <Switch
                                            checked={showTeamChats}
                                            onCheckedChange={setShowTeamChats}
                                            className="scale-75 origin-right"
                                        />
                                    </div>
                                </div>
                                <ScrollArea className="flex-1 p-3">
                                    <div className="space-y-3">
                                        {[...adminChats, ...(showTeamChats ? teamChats : [])]
                                            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                                            .map(chat => {
                                                const team = chat.teamId ? TEAMS.find(t => t.id === chat.teamId) : null;
                                                return (
                                                    <div key={chat.id} className="flex gap-2">
                                                        <Avatar className="w-6 h-6 shrink-0">
                                                            <AvatarFallback className={cn(
                                                                "text-[9px]",
                                                                chat.type === 'admin' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                                            )}>
                                                                {chat.senderName.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-medium">{chat.senderName}</span>
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {team && (
                                                                    <Badge variant="outline" className="ml-auto text-[8px] h-3 px-1">
                                                                        {team.name}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{chat.message}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                        {/* Helper text if empty */}
                                        {adminChats.length === 0 && !showTeamChats && (
                                            <div className="text-center text-xs text-muted-foreground py-8">
                                                No broadcast messages sent.
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                                <div className="p-3 border-t border-border">
                                    <form onSubmit={handleBroadcast} className="flex gap-2">
                                        <Input
                                            placeholder="Broadcast to all..."
                                            value={broadcastMsg}
                                            onChange={e => setBroadcastMsg(e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                        <Button size="sm" type="submit" className="h-8 px-3">
                                            <Send className="w-3.5 h-3.5" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // ============ TEAM VIEW ============
                <div className="flex flex-col h-full">
                    {/* Tab Navigation */}
                    <div className="flex gap-1 p-1 bg-muted/30 rounded-lg mb-4">
                        <button
                            onClick={() => setTeamTab("session")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                                teamTab === "session"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Target className="w-3.5 h-3.5" />
                            Session
                        </button>
                        <button
                            onClick={() => setTeamTab("todos")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                                teamTab === "todos"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Team Todos
                            {teamTodos.filter(t => !t.completed).length > 0 && (
                                <Badge variant="secondary" className="text-[9px] h-4 px-1">
                                    {teamTodos.filter(t => !t.completed).length}
                                </Badge>
                            )}
                        </button>
                        <button
                            onClick={() => setTeamTab("chat")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                                teamTab === "chat"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Team Chat
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden">
                        {teamTab === "session" && activeTeam && (
                            <div className="h-full flex flex-col">
                                {/* Team Identity */}
                                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-background border border-border")}>
                                        <activeTeam.icon className={cn("w-5 h-5", activeTeam.color)} />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{activeTeam.name}</div>
                                        <div className="text-xs text-muted-foreground">{activeTeam.allowedPage}</div>
                                    </div>
                                </div>

                                {/* Current Objective */}
                                <div className="p-4 bg-card border border-border rounded-xl">
                                    <h4 className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5" />
                                        Current Session Objective
                                    </h4>
                                    <div className="text-lg font-medium leading-tight">
                                        {currentObjective}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Assigned by Admin</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {teamTab === "todos" && (
                            <div className="h-full flex flex-col border border-border rounded-xl bg-card overflow-hidden">
                                <div className="p-3 px-4 border-b border-border bg-muted/30 flex items-center justify-between">
                                    <h4 className="text-xs font-semibold flex items-center gap-2">
                                        <CheckSquare className="w-3.5 h-3.5" />
                                        Tasks & TODOs
                                    </h4>
                                    <Badge variant="secondary" className="text-[10px] h-5">
                                        {teamTodos.filter(t => t.completed).length}/{teamTodos.length}
                                    </Badge>
                                </div>
                                <ScrollArea className="flex-1 p-2">
                                    <div className="space-y-1">
                                        {teamTodos.map(todo => (
                                            <div
                                                key={todo.id}
                                                className={cn(
                                                    "group flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer",
                                                    todo.completed && "opacity-60"
                                                )}
                                                onClick={() => toggleTodo(todo.id)}
                                            >
                                                <button className={cn(
                                                    "mt-0.5 shrink-0 transition-colors",
                                                    todo.completed ? "text-green-500" : "text-muted-foreground group-hover:text-primary"
                                                )}>
                                                    {todo.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-sm leading-snug",
                                                        todo.completed && "line-through text-muted-foreground"
                                                    )}>
                                                        {todo.text}
                                                    </p>
                                                    {todo.type === 'admin' && (
                                                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">
                                                            <Shield className="w-2.5 h-2.5" />
                                                            Admin Assigned
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <div className="p-3 border-t border-border">
                                    <form onSubmit={handleAddTodo} className="flex gap-2">
                                        <Input
                                            placeholder="Add a personal task..."
                                            value={newTodo}
                                            onChange={e => setNewTodo(e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                        <Button size="sm" variant="ghost" type="submit" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {teamTab === "chat" && (
                            <div className="h-full flex flex-col border border-border rounded-xl bg-card overflow-hidden">
                                <div className="p-3 px-4 border-b border-border bg-muted/30">
                                    <h4 className="text-xs font-semibold flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        {activeTeam?.name || "Team"} Chat
                                    </h4>
                                </div>
                                <ScrollArea className="flex-1 p-3">
                                    <div className="space-y-3">
                                        {[...adminChats, ...teamChats]
                                            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                                            .map(chat => (
                                                <div key={chat.id} className="flex gap-2">
                                                    <Avatar className="w-6 h-6 shrink-0">
                                                        <AvatarFallback className={cn(
                                                            "text-[9px]",
                                                            chat.type === 'admin' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                                                        )}>
                                                            {chat.senderName.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium flex items-center gap-1">
                                                                {chat.senderName}
                                                                {chat.type === 'admin' && (
                                                                    <Badge variant="outline" className="h-3 text-[8px] px-1 bg-destructive/5 text-destructive border-destructive/20">
                                                                        Admin
                                                                    </Badge>
                                                                )}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{chat.message}</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </ScrollArea>
                                <div className="p-3 border-t border-border">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <Input
                                            placeholder="Type a message..."
                                            value={chatMessage}
                                            onChange={e => setChatMessage(e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                        <Button size="sm" type="submit" className="h-8 px-3">
                                            <Send className="w-3.5 h-3.5" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
