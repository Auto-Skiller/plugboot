"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/core/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/core/ui/dialog";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { Play, Pause, Phone, PhoneOff, PhoneMissed, FileText, User, Bot } from "lucide-react";

export interface CallRecord {
    id: string;
    timestamp: Date;
    customerName: string;
    phone: string;
    agent: {
        name: string;
        avatar?: string;
        initials: string;
    };
    duration: number; // seconds
    outcome: "confirmed" | "cancelled" | "no_answer" | "callback";
    recordingUrl?: string;
}

interface CallHistoryTableProps {
    calls: CallRecord[];
    onPlayRecording?: (url: string) => void;
    className?: string;
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("fr-DZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

const outcomeConfig = {
    confirmed: { label: "Confirmé", variant: "default" as const, icon: Phone },
    cancelled: { label: "Annulé", variant: "destructive" as const, icon: PhoneOff },
    no_answer: { label: "Pas de réponse", variant: "secondary" as const, icon: PhoneMissed },
    callback: { label: "Rappel", variant: "outline" as const, icon: Phone },
};

export function CallHistoryTable({ calls, onPlayRecording, className }: CallHistoryTableProps) {
    const [playingId, setPlayingId] = React.useState<string | null>(null);

    const handlePlay = (call: CallRecord) => {
        if (call.recordingUrl) {
            if (playingId === call.id) {
                setPlayingId(null);
            } else {
                setPlayingId(call.id);
                onPlayRecording?.(call.recordingUrl);
            }
        }
    };

    return (
        <div className={cn("rounded-lg border", className)}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date/Heure</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-12">Audio</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {calls.map((call) => {
                        const outcome = outcomeConfig[call.outcome];
                        const OutcomeIcon = outcome.icon;

                        return (
                            <TableRow key={call.id}>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(call.timestamp)}
                                </TableCell>
                                <TableCell className="font-medium">{call.customerName}</TableCell>
                                <TableCell className="font-mono text-sm">{call.phone}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={call.agent.avatar} />
                                            <AvatarFallback className="text-xs">
                                                {call.agent.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{call.agent.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{formatDuration(call.duration)}</TableCell>
                                <TableCell>
                                    <Badge variant={outcome.variant} className="gap-1">
                                        <OutcomeIcon className="h-3 w-3" />
                                        {outcome.label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {call.recordingUrl && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handlePlay(call)}
                                            >
                                                {playingId === call.id ? (
                                                    <Pause className="h-4 w-4" />
                                                ) : (
                                                    <Play className="h-4 w-4" />
                                                )}
                                            </Button>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Voir la transcription">
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>Transcription de l&apos;appel</DialogTitle>
                                                        <DialogDescription>
                                                            {formatDate(call.timestamp)} • {formatDuration(call.duration)}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <ScrollArea className="h-[300px] pr-4">
                                                        <div className="space-y-4 text-sm">
                                                            <div className="flex gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                                    <User className="h-4 w-4 text-primary" />
                                                                </div>
                                                                <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                                                                    <p className="font-semibold text-xs mb-1">{call.agent.name}</p>
                                                                    <p>Bonjour, ici {call.agent.name} de Riglify. Je vous appelle concernant votre commande.</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3 flex-row-reverse">
                                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                                    <User className="h-4 w-4 text-secondary-foreground" />
                                                                </div>
                                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg rounded-tr-none">
                                                                    <p className="font-semibold text-xs mb-1 text-right">{call.customerName}</p>
                                                                    <p>Ah oui, bonjour. Je voulais savoir quand elle arrivera ?</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                                    <User className="h-4 w-4 text-primary" />
                                                                </div>
                                                                <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                                                                    <p className="font-semibold text-xs mb-1">{call.agent.name}</p>
                                                                    <p>Elle est prévue pour demain matin entre 9h et 12h.</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3 flex-row-reverse">
                                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                                    <User className="h-4 w-4 text-secondary-foreground" />
                                                                </div>
                                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg rounded-tr-none">
                                                                    <p className="font-semibold text-xs mb-1 text-right">{call.customerName}</p>
                                                                    <p>Parfait, je serai là. Merci !</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </ScrollArea>
                                                </DialogContent>
                                            </Dialog>

                                            {playingId === call.id && (
                                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                                    <div className="h-1 w-16 bg-secondary rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary animate-progress origin-left" style={{ animationDuration: '5s' }}></div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground tabular-nums">0:05</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

// Mock data
export const mockCallHistory: CallRecord[] = [
    {
        id: "CALL-001",
        timestamp: new Date("2024-12-05T10:30:00"),
        customerName: "Amine M.",
        phone: "0550123456",
        agent: { name: "Sarah K.", initials: "SK" },
        duration: 185,
        outcome: "confirmed",
        recordingUrl: "/recordings/call-001.mp3",
    },
    {
        id: "CALL-002",
        timestamp: new Date("2024-12-05T10:15:00"),
        customerName: "Karim S.",
        phone: "0770987654",
        agent: { name: "Ahmed B.", initials: "AB" },
        duration: 45,
        outcome: "no_answer",
    },
    {
        id: "CALL-003",
        timestamp: new Date("2024-12-05T09:45:00"),
        customerName: "Nadia B.",
        phone: "0661234567",
        agent: { name: "Sarah K.", initials: "SK" },
        duration: 210,
        outcome: "confirmed",
        recordingUrl: "/recordings/call-003.mp3",
    },
    {
        id: "CALL-004",
        timestamp: new Date("2024-12-05T09:20:00"),
        customerName: "Fatima Z.",
        phone: "0555123789",
        agent: { name: "Ahmed B.", initials: "AB" },
        duration: 120,
        outcome: "callback",
        recordingUrl: "/recordings/call-004.mp3",
    },
    {
        id: "CALL-005",
        timestamp: new Date("2024-12-04T16:30:00"),
        customerName: "Mohamed L.",
        phone: "0661987654",
        agent: { name: "Sarah K.", initials: "SK" },
        duration: 95,
        outcome: "cancelled",
        recordingUrl: "/recordings/call-005.mp3",
    },
];
