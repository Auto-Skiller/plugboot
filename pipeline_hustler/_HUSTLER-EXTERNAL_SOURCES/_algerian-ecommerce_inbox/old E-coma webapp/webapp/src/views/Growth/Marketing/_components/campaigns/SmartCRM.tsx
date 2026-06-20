"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Users, Search, Filter, RefreshCw, Mail, Phone, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/core/ui/input";
import { Badge } from "@/components/core/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/ui/avatar";
import { toast } from "sonner";

const MOCK_CONTACTS = [
    { id: 1, name: "Amine Benali", email: "amine@example.com", phone: "+213 555 123 456", score: 85, status: "High Value", initial: "AB" },
    { id: 2, name: "Sarah K.", email: "sarah@example.com", phone: "+213 661 987 654", score: 92, status: "VIP", initial: "SK" },
    { id: 3, name: "Mohamed D.", email: "mohamed@example.com", phone: "+213 770 112 233", score: 45, status: "Risk", initial: "MD" },
    { id: 4, name: "Yasmine Z.", email: "yasmine@example.com", phone: "+213 550 445 566", score: 78, status: "Active", initial: "YZ" },
    { id: 5, name: "Karim T.", email: "karim@example.com", phone: "+213 662 334 455", score: 60, status: "Active", initial: "KT" },
];

export default function SmartCRM() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [filter, setFilter] = useState("all");

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            toast.success("Contacts synced successfully!");
        }, 2000);
    };

    const filteredContacts = filter === "all"
        ? MOCK_CONTACTS
        : filter === "vip"
            ? MOCK_CONTACTS.filter(c => c.score > 80)
            : MOCK_CONTACTS.filter(c => c.score < 50);

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-500" />
                            Smart CRM
                        </CardTitle>
                        <CardDescription>Manage customer relationships and segments</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleSync} disabled={isSyncing}>
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                        Sync Contacts
                    </Button>
                </div>
            </CardHeader>
            <div className="p-4 bg-muted/20 border-b flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search contacts..." className="pl-9 bg-background" />
                </div>
                <Tabs value={filter} onValueChange={setFilter} className="flex-1">
                    <TabsList>
                        <TabsTrigger value="all">All Contacts</TabsTrigger>
                        <TabsTrigger value="vip">VIP & High Value</TabsTrigger>
                        <TabsTrigger value="risk">At Risk</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="ghost" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground sticky top-0">
                        <tr>
                            <th className="px-6 py-3 font-medium">Customer</th>
                            <th className="px-6 py-3 font-medium">Contact</th>
                            <th className="px-6 py-3 font-medium">Health Score</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredContacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-muted/10 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                {contact.initial}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">{contact.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    <div className="flex flex-col text-xs gap-1">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3" /> {contact.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3 w-3" /> {contact.phone}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${contact.score > 80 ? "bg-green-500" : contact.score < 50 ? "bg-red-500" : "bg-yellow-500"}`}
                                                style={{ width: `${contact.score}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono">{contact.score}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        variant={contact.score > 80 ? "default" : "outline"}
                                        className={contact.score < 50 ? "text-red-500 border-red-200" : ""}
                                    >
                                        {contact.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
