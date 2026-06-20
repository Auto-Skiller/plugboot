"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/ui/avatar";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Badge } from "@/components/core/ui/badge";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { Separator } from "@/components/core/ui/separator";
import {
    Search,
    Phone,
    MoreVertical,
    Paperclip,
    Send,
    Check,
    CheckCheck,
    Clock,
    User,
    Bot,
    UserPlus
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/core/ui/select";

// Mock Data
interface Message {
    id: string;
    text: string;
    sender: "user" | "contact";
    timestamp: string;
    status: "sent" | "delivered" | "read";
}

interface Conversation {
    id: string;
    contact: {
        name: string;
        avatar?: string;
        initials: string;
        phone: string;
        email: string;
        location: string;
    };
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isActive: boolean;
    messages: Message[];
    tags: string[];
    assignedTo?: string;
}

const mockConversations: Conversation[] = [
    {
        id: "1",
        contact: {
            name: "Amine M.",
            initials: "AM",
            phone: "0550123456",
            email: "amine.m@example.com",
            location: "Oran, Algeria"
        },
        lastMessage: "Est-ce que la livraison est gratuite ?",
        lastMessageTime: "10:30",
        unreadCount: 2,
        isActive: true,
        tags: ["New Customer", "Inquiry"],
        messages: [
            { id: "m1", text: "Bonjour, je suis intéressé par le produit.", sender: "contact", timestamp: "10:28", status: "read" },
            { id: "m2", text: "Est-ce que la livraison est gratuite ?", sender: "contact", timestamp: "10:30", status: "read" }
        ]
    },
    {
        id: "2",
        contact: {
            name: "Karim S.",
            initials: "KS",
            phone: "0770987654",
            email: "karim.s@example.com",
            location: "Algiers, Algeria"
        },
        lastMessage: "Merci pour votre réponse rapide.",
        lastMessageTime: "Hier",
        unreadCount: 0,
        isActive: false,
        tags: ["Support", "Resolved"],
        messages: [
            { id: "m1", text: "Mon colis est arrivé endommagé.", sender: "contact", timestamp: "Yesterday", status: "read" },
            { id: "m2", text: "Désolé d'entendre cela. Pouvez-vous envoyer une photo ?", sender: "user", timestamp: "Yesterday", status: "read" },
            { id: "m3", text: "Merci pour votre réponse rapide.", sender: "contact", timestamp: "Yesterday", status: "read" }
        ]
    },
    {
        id: "3",
        contact: {
            name: "Nadia B.",
            initials: "NB",
            phone: "0661234567",
            email: "nadia.b@example.com",
            location: "Setif, Algeria"
        },
        lastMessage: "Quand est-ce que je recevrai ma commande ?",
        lastMessageTime: "Hier",
        unreadCount: 0,
        isActive: false,
        tags: ["Order Status"],
        messages: [
            { id: "m1", text: "J'ai commandé il y a 2 jours.", sender: "contact", timestamp: "Yesterday", status: "read" },
            { id: "m2", text: "Quand est-ce que je recevrai ma commande ?", sender: "contact", timestamp: "Yesterday", status: "read" }
        ]
    }
];

export function ConversationInbox() {
    const [activeId, setActiveId] = React.useState<string>("1");
    const [messageInput, setMessageInput] = React.useState("");
    const [isAiActive, setIsAiActive] = React.useState(false);

    const activeConv = mockConversations.find(c => c.id === activeId) || mockConversations[0];

    const handleQuickReply = (text: string) => {
        setMessageInput(prev => prev + (prev ? " " : "") + text);
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] min-h-[600px] border rounded-lg overflow-hidden bg-background shadow-sm">
            {/* Left: Conversation List */}
            <div className="w-80 border-r flex flex-col bg-muted/10">
                <div className="p-4 border-b space-y-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher..." className="pl-9 bg-background" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">Tous</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80">Non lus</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80">Support</Badge>
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {mockConversations.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setActiveId(conv.id)}
                                className={cn(
                                    "p-4 border-b cursor-pointer transition-colors hover:bg-muted/50",
                                    activeId === conv.id && "bg-muted border-l-4 border-l-primary"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative">
                                        <Avatar>
                                            <AvatarImage src={conv.contact.avatar} />
                                            <AvatarFallback className="bg-primary/10 text-primary">{conv.contact.initials}</AvatarFallback>
                                        </Avatar>
                                        {conv.isActive && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <span className={cn("font-medium truncate", conv.unreadCount > 0 && "font-bold")}>
                                                {conv.contact.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                {conv.lastMessageTime}
                                            </span>
                                        </div>
                                        <p className={cn("text-sm text-muted-foreground truncate", conv.unreadCount > 0 && "text-foreground font-medium")}>
                                            {conv.lastMessage}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {conv.tags.map(tag => (
                                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">
                                                    {tag}
                                                </span>
                                            ))}
                                            {conv.unreadCount > 0 && (
                                                <Badge className="ml-auto rounded-full h-5 w-5 p-0 flex items-center justify-center">
                                                    {conv.unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Center: Messages */}
            <div className="flex-1 flex flex-col bg-background">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={activeConv.contact.avatar} />
                            <AvatarFallback>{activeConv.contact.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                {activeConv.contact.name}
                                <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                    {activeConv.contact.phone}
                                </Badge>
                                {isAiActive && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 gap-1">
                                        <Bot className="w-3 h-3" /> AI Agent
                                    </Badge>
                                )}
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                En ligne
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select defaultValue="me">
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Assigné à" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="me">Moi</SelectItem>
                                <SelectItem value="sarah">Sarah K.</SelectItem>
                                <SelectItem value="ahmed">Ahmed B.</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant={isAiActive ? "default" : "outline"}
                            size="sm"
                            className={cn("gap-2", isAiActive && "bg-purple-600 hover:bg-purple-700")}
                            onClick={() => setIsAiActive(!isAiActive)}
                        >
                            <Bot className="h-4 w-4" />
                            {isAiActive ? "AI Active" : "Activer AI"}
                        </Button>

                        <div className="h-6 w-px bg-border mx-1"></div>

                        <Button variant="ghost" size="icon" title="Appeler">
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <div className="flex justify-center">
                            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                Aujourd&apos;hui
                            </span>
                        </div>
                        {activeConv.messages.map(msg => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex w-full",
                                    msg.sender === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "flex flex-col max-w-[70%]",
                                    msg.sender === "user" ? "items-end" : "items-start"
                                )}>
                                    <div className={cn(
                                        "px-4 py-2 rounded-2xl text-sm shadow-sm",
                                        msg.sender === "user"
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-muted text-foreground rounded-bl-none"
                                    )}>
                                        {msg.text}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 px-1">
                                        <span className="text-[10px] text-muted-foreground">
                                            {msg.timestamp}
                                        </span>
                                        {msg.sender === "user" && (
                                            <CheckCheck className="h-3 w-3 text-blue-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t bg-background">
                    <div className="max-w-3xl mx-auto flex gap-2 items-end">
                        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Tapez votre message..."
                                className="pr-10 min-h-[44px] py-3"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        setMessageInput("");
                                    }
                                }}
                            />
                        </div>
                        <Button className="shrink-0 h-11 w-11 rounded-full" size="icon">
                            <Send className="h-5 w-5 ml-0.5" />
                        </Button>
                    </div>
                    <div className="max-w-3xl mx-auto mt-2 flex gap-2 overflow-x-auto scrollbar-hide">
                        <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-muted whitespace-nowrap transition-colors"
                            onClick={() => handleQuickReply("👋 Bonjour, comment puis-je vous aider ?")}
                        >
                            👋 Bonjour, comment puis-je vous aider ?
                        </Badge>
                        <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-muted whitespace-nowrap transition-colors"
                            onClick={() => handleQuickReply("📦 Votre commande est en cours de livraison")}
                        >
                            📦 Votre commande est en cours de livraison
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Right: Contact Info */}
            <div className="w-72 border-l bg-muted/10 hidden xl:flex flex-col">
                <div className="p-6 flex flex-col items-center border-b">
                    <Avatar className="h-20 w-20 mb-4">
                        <AvatarImage src={activeConv.contact.avatar} />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">{activeConv.contact.initials}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{activeConv.contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{activeConv.contact.location}</p>

                    <div className="flex gap-2 mt-4 w-full">
                        <Button variant="outline" className="flex-1 gap-2">
                            <User className="h-4 w-4" />
                            Profil
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2">
                            <Phone className="h-4 w-4" />
                            Appeler
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Coordonnées</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-muted-foreground">Email</label>
                                    <p className="text-sm font-medium">{activeConv.contact.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground">Téléphone</label>
                                    <p className="text-sm font-medium">{activeConv.contact.phone}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Dernières Commandes</h4>
                            <div className="space-y-3">
                                <div className="p-3 bg-background border rounded-lg">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs font-medium">#ORD-001</span>
                                        <Badge variant="outline" className="text-[10px] h-5">En cours</Badge>
                                    </div>
                                    <p className="text-sm font-medium">4,500 DA</p>
                                    <p className="text-xs text-muted-foreground">Il y a 2 jours</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {activeConv.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                                <Badge variant="outline" className="text-xs border-dashed cursor-pointer hover:bg-muted">
                                    + Ajouter
                                </Badge>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
