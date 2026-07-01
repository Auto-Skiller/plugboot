"use client";

import { useState } from 'react';
import { MessageSquare, Search, Filter, Send, Phone, Video, MoreVertical, CheckCircle2, Inbox, Star, Shield, EyeOff, Mail as MailIcon, Plus as PlusIcon } from 'lucide-react';
import { Button } from '@/components/core/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card';
import Image from 'next/image';

// Mock Messages
const MESSAGES = [
    { id: 1, user: 'Amine Benali', avatar: 'https://i.pravatar.cc/150?u=1', platform: 'Instagram', message: 'Salam! Is this available in Oran?', time: '2m ago', unread: true },
    { id: 2, user: 'Sarah Kaci', avatar: 'https://i.pravatar.cc/150?u=2', platform: 'Facebook', message: 'Prix svp? Livraison à Alger?', time: '15m ago', unread: true },
    { id: 3, user: 'Yacine Ouali', avatar: 'https://i.pravatar.cc/150?u=3', platform: 'TikTok', message: 'Top content! Collab possible?', time: '1h ago', unread: false },
    { id: 4, user: 'Nadia Ziani', avatar: 'https://i.pravatar.cc/150?u=4', platform: 'Instagram', message: 'Win waslet la commande #12345?', time: '3h ago', unread: false },
];



export default function UnifiedInboxPage() {
    const [selectedMessage, setSelectedMessage] = useState(MESSAGES[0]);
    const [replyText, setReplyText] = useState('');

    return (
        <div className="h-[calc(100vh-4rem)] flex bg-gray-50 dark:bg-background">

            {/* Left Sidebar: Navigation & List */}
            <div className="w-80 bg-white dark:bg-card border-r border-gray-200 dark:border-border flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-border space-y-4">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
                        <Inbox className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        Unified Inbox
                    </h1>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                        <input
                            type="text"
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-muted border-transparent rounded-lg text-sm focus:bg-white dark:focus:bg-card focus:ring-2 focus:ring-blue-500 transition-all dark:text-foreground dark:placeholder:text-muted-foreground"
                            placeholder="Search..."
                        />
                    </div>
                </div>

                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {['All', 'Instagram', 'Facebook', 'TikTok'].map((platform) => (
                        <button
                            key={platform}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-200 dark:hover:bg-muted/80 transition-colors whitespace-nowrap"
                        >
                            {platform}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {MESSAGES.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500 dark:text-muted-foreground">
                            <Inbox className="w-12 h-12 mb-2 opacity-20" />
                            <p className="text-sm font-medium">No messages yet</p>
                            <p className="text-xs">New messages will appear here.</p>
                        </div>
                    ) : (
                        MESSAGES.map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => setSelectedMessage(msg)}
                                className={`group w-full p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors border-b border-gray-100 dark:border-border text-left cursor-pointer relative ${selectedMessage.id === msg.id ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                                        <Image src={msg.avatar} alt={msg.user} fill className="object-cover" unoptimized />
                                    </div>
                                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-card flex items-center justify-center text-[8px] text-white ${msg.platform === 'Instagram' ? 'bg-pink-500' :
                                        msg.platform === 'Facebook' ? 'bg-blue-600' : 'bg-black'
                                        }`}>
                                        {msg.platform[0]}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={`text-sm font-medium truncate ${msg.unread ? 'text-gray-900 dark:text-foreground font-bold' : 'text-gray-700 dark:text-muted-foreground'}`}>
                                            {msg.user}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-muted-foreground shrink-0">{msg.time}</span>
                                    </div>
                                    <p className={`text-sm truncate pr-8 ${msg.unread ? 'text-gray-900 dark:text-foreground font-medium' : 'text-gray-500 dark:text-muted-foreground'}`}>
                                        {msg.message}
                                    </p>
                                </div>
                                {msg.unread && <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full self-center shrink-0"></div>}

                                {/* Quick Actions (Visible on Hover) */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-card/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-muted rounded-md text-gray-400 hover:text-yellow-500 transition-colors" title="Star">
                                        <Star className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-muted rounded-md text-gray-400 hover:text-blue-500 transition-colors" title="Mark as Unread">
                                        <MailIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-card overflow-hidden">

                {/* MESSAGES VIEW */}
                <>
                    {/* Chat Header */}
                    <div className="h-16 border-b border-gray-200 dark:border-border flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                <Image src={selectedMessage.avatar} alt={selectedMessage.user} fill className="object-cover" unoptimized />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-foreground">{selectedMessage.user}</h2>
                                <p className="text-xs text-gray-500 dark:text-muted-foreground flex items-center gap-1">
                                    via {selectedMessage.platform} • <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Active now
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 text-gray-400 dark:text-muted-foreground">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-full"><Phone className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-full"><Video className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-full"><MoreVertical className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/50 dark:bg-background/50">
                        <div className="flex justify-center">
                            <span className="text-xs text-gray-400 dark:text-muted-foreground bg-gray-100 dark:bg-muted px-3 py-1 rounded-full">Today</span>
                        </div>

                        <div className="flex gap-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden self-end">
                                <Image src={selectedMessage.avatar} alt={selectedMessage.user} fill className="object-cover" unoptimized />
                            </div>
                            <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl rounded-bl-none p-3 max-w-md shadow-sm">
                                <p className="text-sm text-gray-800 dark:text-foreground">{selectedMessage.message}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white text-xs font-bold self-end">You</div>
                            <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-2xl rounded-br-none p-3 max-w-md shadow-md">
                                <p className="text-sm">Salam Amine! Yes, we deliver to Oran via Yalidine (58 wilayas). Would you like to order?</p>
                            </div>
                        </div>

                        {/* AI Suggestion */}
                        <div className="flex flex-col items-center gap-2 mt-4">
                            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span> AI Suggested Reply
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors">
                                    Oui, livraison 48h avec Yalidine! 🚚
                                </button>
                                <button className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors">
                                    Marhba! On livre partout en Algérie. 🇩🇿
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 dark:border-border bg-white dark:bg-card">
                        <div className="flex items-end gap-2 bg-gray-50 dark:bg-muted p-2 rounded-xl border border-gray-200 dark:border-border focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                            <button className="p-2 text-gray-400 dark:text-muted-foreground hover:text-gray-600 dark:hover:text-foreground"><PlusIcon className="w-5 h-5" /></button>
                            <textarea
                                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2 text-sm dark:text-foreground dark:placeholder:text-muted-foreground"
                                placeholder="Type a message..."
                                rows={1}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                            <button className="p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>



            </div>

            {/* Right Sidebar: Customer Details */}
            <div className="w-72 bg-white dark:bg-card border-l border-gray-200 dark:border-border p-6 hidden xl:block">
                <div className="text-center mb-6">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3">
                        <Image src={selectedMessage.avatar} alt={selectedMessage.user} fill className="object-cover" unoptimized />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-foreground text-lg">{selectedMessage.user}</h3>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">New Customer</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider mb-3">Contact Info</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-foreground"><MailIcon className="w-4 h-4 text-gray-400 dark:text-muted-foreground" /> amine@example.com</div>
                            <div className="flex items-center gap-2 text-gray-700 dark:text-foreground"><Phone className="w-4 h-4 text-gray-400 dark:text-muted-foreground" /> +213 5 55 12 34 56</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase tracking-wider mb-3">Recent Orders</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-muted rounded-lg border border-gray-100 dark:border-border">
                                <div>
                                    <div className="font-medium text-sm text-gray-900 dark:text-foreground">Order #1024</div>
                                    <div className="text-xs text-gray-500 dark:text-muted-foreground">2 days ago</div>
                                </div>
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded font-medium">4,500 DA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
