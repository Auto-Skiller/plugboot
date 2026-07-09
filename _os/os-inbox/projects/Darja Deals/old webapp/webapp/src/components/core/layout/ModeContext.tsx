"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { Team, TEAMS, getTeamByPage, getTeamById } from "@/config/teams";

type ScreenMode = "ADMIN" | "TEAM";

// Todo and Chat types for session management
export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    type: 'admin' | 'team';
    teamId?: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: Date;
    type: 'admin' | 'team';
    teamId?: string;
}

interface ModeContextType {
    mode: ScreenMode;
    activeTeam: Team | null;
    sessionObjective: string;
    setSessionObjective: (objective: string) => void;
    switchToTeamMode: (teamId: string) => void;
    switchToAdminMode: (pin: string) => boolean;
    getTeamFromPath: (pathname: string) => Team | null;
    isAdmin: boolean;
    // New: Team management
    activeTeams: Team[];
    onlineTeams: Team[]; // Teams currently open in other tabs
    setTeamActive: (teamId: string, active: boolean) => void;
    canAccessPage: (pathname: string) => boolean;
    // New: Todos & Chats
    adminTodos: TodoItem[];
    teamTodos: TodoItem[];
    addTodo: (text: string, type: 'admin' | 'team') => void;
    toggleTodo: (id: string) => void;
    adminChats: ChatMessage[];
    teamChats: ChatMessage[];
    sendMessage: (message: string, type: 'admin' | 'team') => void;
    // Team objectives per team
    teamObjectives: Record<string, string>;
    setTeamObjective: (teamId: string, objective: string) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<ScreenMode>("ADMIN");
    const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
    const [sessionObjective, setSessionObjective] = useState<string>("Q4 Growth Strategy Implementation");

    // Session Heartbeat for Cross-Tab Tracking
    const [onlineTeams, setOnlineTeams] = useState<Team[]>([]);
    const sessionIdRef = useRef<string>("");

    useEffect(() => {
        if (!sessionIdRef.current) {
            sessionIdRef.current = Math.random().toString(36).substring(2, 15);
        }

        const heartbeat = () => {
            const now = Date.now();
            const STORAGE_KEY = "riglify-active-sessions";

            try {
                // Read existing sessions
                const stored = localStorage.getItem(STORAGE_KEY);
                let sessions: any[] = stored ? JSON.parse(stored) : [];

                // Prune stale sessions (> 4s old)
                sessions = sessions.filter((s: any) => now - s.lastHeartbeat < 4000);

                // Update or add self
                const selfIndex = sessions.findIndex((s: any) => s.id === sessionIdRef.current);
                const selfSession = {
                    id: sessionIdRef.current,
                    mode,
                    teamId: activeTeamId,
                    lastHeartbeat: now
                };

                if (selfIndex >= 0) {
                    sessions[selfIndex] = selfSession;
                } else {
                    sessions.push(selfSession);
                }

                // Save back
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

                // Update local state of online teams (excluding self if we are admin, or including everyone)
                // We want to see ALL teams that are open.
                const onlineTeamIds = new Set(
                    sessions
                        .filter((s: any) => s.mode === "TEAM" && s.teamId)
                        .map((s: any) => s.teamId)
                );

                // Filter TEAMS to get Team objects
                setOnlineTeams(TEAMS.filter(t => onlineTeamIds.has(t.id)));

            } catch (e) {
                console.error("Session heartbeat failed", e);
            }
        };

        const interval = setInterval(heartbeat, 1000);
        heartbeat(); // Run immediately

        return () => clearInterval(interval);
    }, [mode, activeTeamId]);

    // Teams with active state
    const [teamsState, setTeamsState] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        TEAMS.forEach(t => initial[t.id] = t.isActive);
        return initial;
    });

    // Todos
    const [adminTodos, setAdminTodos] = useState<TodoItem[]>([
        { id: '1', text: 'Review Q3 Sales Report', completed: true, type: 'admin' },
        { id: '2', text: 'Update Stock Levels for Category A', completed: false, type: 'admin' },
        { id: '3', text: 'Schedule team meetings', completed: false, type: 'admin' },
    ]);
    const [teamTodos, setTeamTodos] = useState<TodoItem[]>([
        { id: '4', text: 'Process pending orders', completed: false, type: 'team', teamId: 'confirmation' },
        { id: '5', text: 'Upload new creatives', completed: false, type: 'team', teamId: 'creative' },
    ]);

    // Chats
    const [adminChats, setAdminChats] = useState<ChatMessage[]>([
        { id: '1', senderId: 'admin', senderName: 'Admin', message: 'All teams, please update your daily reports', timestamp: new Date(), type: 'admin' },
    ]);
    const [teamChats, setTeamChats] = useState<ChatMessage[]>([
        { id: '2', senderId: 'user1', senderName: 'Sarah', message: 'Confirmation queue is clear!', timestamp: new Date(), type: 'team', teamId: 'confirmation' },
    ]);

    // Team objectives
    const [teamObjectives, setTeamObjectivesState] = useState<Record<string, string>>({
        analytics: "Complete Q4 reports",
        confirmation: "Clear pending orders",
        stock: "Inventory count",
        creative: "Launch new campaign assets",
        mediaBuying: "Optimize ROAS",
        marketing: "Email sequence setup",
        sourcing: "Find 5 new products",
    });

    // Load state from localStorage on mount
    useEffect(() => {
        const init = async () => {
            const savedMode = localStorage.getItem("system-mode") as ScreenMode;
            const savedTeamId = localStorage.getItem("active-team-id");
            const savedTeamsState = localStorage.getItem("teams-active-state");

            if (savedMode) setMode(savedMode);
            if (savedTeamId) setActiveTeamId(savedTeamId);
            if (savedTeamsState) {
                try {
                    setTeamsState(JSON.parse(savedTeamsState));
                } catch (e) {
                    console.error("Failed to parse teams state", e);
                }
            }

            // RBAC Check: Force TEAM mode if not admin
            const { createBrowserClient } = await import('@supabase/ssr');
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: merchant } = await supabase
                    .from('merchants')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (merchant?.role !== 'admin') {
                    setMode("TEAM");
                    // Optionally clear admin local storage if needed, but the mode override is enough for now
                }
            }
        };
        init();
    }, []);

    // Derive active teams from state
    const activeTeams = TEAMS.filter(t => teamsState[t.id] === true);
    const activeTeam = activeTeamId ? getTeamById(activeTeamId) : null;

    const switchToTeamMode = (teamId: string) => {
        setMode("TEAM");
        setActiveTeamId(teamId);
        localStorage.setItem("system-mode", "TEAM");
        localStorage.setItem("active-team-id", teamId);
    };

    const switchToAdminMode = (pin: string): boolean => {
        // Mock PIN validation - 1234
        if (pin === "1234") {
            setMode("ADMIN");
            setActiveTeamId(null);
            localStorage.setItem("system-mode", "ADMIN");
            localStorage.removeItem("active-team-id");
            return true;
        }
        return false;
    };

    const getTeamFromPath = (pathname: string): Team | null => {
        return getTeamByPage(pathname);
    };

    const setTeamActive = (teamId: string, active: boolean) => {
        setTeamsState(prev => {
            const updated = { ...prev, [teamId]: active };
            localStorage.setItem("teams-active-state", JSON.stringify(updated));
            return updated;
        });
    };

    const canAccessPage = (pathname: string): boolean => {
        // Admin can access all pages
        if (mode === "ADMIN") return true;

        // Team mode: check if current team is allowed
        if (activeTeam) {
            // Check if team is active/unlocked
            if (!teamsState[activeTeam.id]) return false;

            return pathname.startsWith(activeTeam.allowedPage);
        }
        return false;
    };

    const addTodo = (text: string, type: 'admin' | 'team') => {
        const newTodo: TodoItem = {
            id: Date.now().toString(),
            text,
            completed: false,
            type,
            teamId: type === 'team' && activeTeam ? activeTeam.id : undefined,
        };
        if (type === 'admin') {
            setAdminTodos(prev => [...prev, newTodo]);
        } else {
            setTeamTodos(prev => [...prev, newTodo]);
        }
    };

    const toggleTodo = (id: string) => {
        setAdminTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        setTeamTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const sendMessage = (message: string, type: 'admin' | 'team') => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            senderId: 'current-user',
            senderName: mode === 'ADMIN' ? 'Admin' : (activeTeam?.name || 'User'),
            message,
            timestamp: new Date(),
            type,
            teamId: type === 'team' && activeTeam ? activeTeam.id : undefined,
        };
        if (type === 'admin') {
            setAdminChats(prev => [...prev, newMessage]);
        } else {
            setTeamChats(prev => [...prev, newMessage]);
        }
    };

    const setTeamObjective = (teamId: string, objective: string) => {
        setTeamObjectivesState(prev => ({ ...prev, [teamId]: objective }));
    };

    return (
        <ModeContext.Provider value={{
            mode,
            activeTeam,
            sessionObjective,
            setSessionObjective,
            switchToTeamMode,
            switchToAdminMode,
            getTeamFromPath,
            isAdmin: mode === "ADMIN",
            activeTeams,
            onlineTeams,
            setTeamActive,
            canAccessPage,
            adminTodos,
            teamTodos,
            addTodo,
            toggleTodo,
            adminChats,
            teamChats,
            sendMessage,
            teamObjectives,
            setTeamObjective,
        }}>
            {children}
        </ModeContext.Provider>
    );
}

export function useMode() {
    const context = useContext(ModeContext);
    if (!context) {
        throw new Error("useMode must be used within a ModeProvider");
    }
    return context;
}
