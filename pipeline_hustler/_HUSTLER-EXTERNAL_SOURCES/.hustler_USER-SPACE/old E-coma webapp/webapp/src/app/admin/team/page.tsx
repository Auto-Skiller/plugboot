"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/core/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/ui/avatar";
import { Badge } from "@/components/core/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/core/ui/dropdown-menu";
import { Switch } from "@/components/core/ui/switch";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { UserPlus, MoreVertical, Shield, Mail, Lock, Key, Smartphone, AlertTriangle, CheckCircle, Eye, EyeOff, User } from "lucide-react";
import { ScrollReveal } from "@/components/core/ui/advanced-motion";
import { cn } from "@/lib/utils";

type TeamMember = {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'team';
    status: 'active' | 'pending' | 'inactive';
    lastLogin?: Date;
    avatar?: string;
    initials: string;
};

const MOCK_MEMBERS: TeamMember[] = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@riglify.com',
        role: 'admin',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        initials: 'AU'
    },
    {
        id: '2',
        name: 'Sarah Member',
        email: 'sarah@riglify.com',
        role: 'team',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        initials: 'SM'
    },
    {
        id: '3',
        name: 'John Staff',
        email: 'john@riglify.com',
        role: 'team',
        status: 'pending',
        initials: 'JS'
    }
];

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS);
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const { createBrowserClient } = await import('@supabase/ssr');
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                // Fetch users from 'merchants' table
                // Note: This assumes 'merchants' table holds all users. 
                // In a real app you might filter by organization_id
                const { data, error } = await supabase
                    .from('merchants')
                    .select('*');

                if (error) {
                    console.error('Error fetching members:', error);
                    return;
                }

                if (data && data.length > 0) {
                    const mappedMembers: TeamMember[] = data.map((user: any) => ({
                        id: user.id,
                        name: user.name || user.email?.split('@')[0] || 'Unknown',
                        email: user.email || '',
                        role: user.role === 'admin' ? 'admin' : 'team',
                        status: 'active', // Default to active since we found them in DB
                        lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
                        avatar: user.avatar_url,
                        initials: (user.name || user.email || 'U').substring(0, 2).toUpperCase()
                    }));
                    setMembers(mappedMembers);
                }
            } catch (err) {
                console.error('Failed to load members', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const formatDate = (date?: Date) => {
        if (!date) return 'Never';
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(date);
    };

    const handleRoleChange = async (memberId: string, currentRole: 'admin' | 'team') => {
        const newRole = currentRole === 'admin' ? 'team' : 'admin';

        // Optimistic update
        setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));

        try {
            const { createBrowserClient } = await import('@supabase/ssr');
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            await supabase
                .from('merchants')
                .update({ role: newRole })
                .eq('id', memberId);

        } catch (err) {
            console.error("Failed to update role", err);
            // Revert on failure
            setMembers(members.map(m => m.id === memberId ? { ...m, role: currentRole } : m));
        }
    };

    return (
        <div className="max-w-6xl space-y-12 p-4 md:p-6 rounded-xl">
            {/* Section 1: Team Management */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
                        <p className="text-muted-foreground">Manage your team members and their permissions.</p>
                    </div>
                    <ScrollReveal direction="down">
                        <Button className="box-glow">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite Member
                        </Button>
                    </ScrollReveal>
                </div>

                <ScrollReveal delay={0.1}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>{members.length} active members in your workspace.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={member.avatar} />
                                                        <AvatarFallback>{member.initials}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{member.name}</p>
                                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={member.role === 'admin' ? 'default' : 'secondary'}
                                                    className={cn(
                                                        "capitalize gap-1",
                                                        member.role === 'admin' && "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
                                                    )}
                                                >
                                                    {member.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                    {member.role === 'admin' ? 'Administrator' : 'Team Member'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        member.status === 'active' ? "bg-green-500" :
                                                            member.status === 'pending' ? "bg-yellow-500" : "bg-gray-400"
                                                    )} />
                                                    <span className="capitalize">{member.status}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(member.lastLogin)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, member.role)}>
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            {member.role === 'admin' ? 'Demote to Team' : 'Promote to Admin'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Mail className="h-4 w-4 mr-2" /> Resend Invite
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive">
                                                            Deactivate
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </section>

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Section 2: Security Settings */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
                    <p className="text-muted-foreground">Manage your account security and authentication preferences.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Security Status - Full Width */}
                    <div className="md:col-span-2">
                        <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-green-500/20">
                                        <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-green-900 dark:text-green-400">Account Security: Good</p>
                                        <p className="text-sm text-green-700 dark:text-green-500">
                                            Your account is protected. Enable 2FA for maximum security.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Change Password */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription>Update your password regularly.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="current-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" placeholder="••••••••" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" placeholder="••••••••" />
                            </div>
                            <Button className="w-full">Update Password</Button>
                        </CardContent>
                    </Card>

                    {/* Two-Factor Authentication */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5" />
                                Two-Factor Authentication
                            </CardTitle>
                            <CardDescription>Add an extra layer of security.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${twoFactorEnabled ? 'bg-green-500/20' : 'bg-muted'}`}>
                                        {twoFactorEnabled ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {twoFactorEnabled ? "2FA is enabled" : "2FA is not enabled"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {twoFactorEnabled
                                                ? "Your account is protected."
                                                : "Enable 2FA for enhanced security."}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={twoFactorEnabled}
                                    onCheckedChange={setTwoFactorEnabled}
                                />
                            </div>
                            {!twoFactorEnabled && (
                                <Button variant="outline" className="w-full">
                                    <Key className="h-4 w-4 mr-2" />
                                    Set Up Two-Factor Authentication
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Active Sessions */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Active Sessions</CardTitle>
                            <CardDescription>Manage devices where you&apos;re currently logged in.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-muted">
                                        <Smartphone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">Chrome on Windows</p>
                                            <Badge variant="default" className="text-xs">Current</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Algiers, Algeria • Active now</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-muted">
                                        <Smartphone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Safari on iPhone</p>
                                        <p className="text-sm text-muted-foreground">Algiers, Algeria • 2 days ago</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="text-destructive">
                                    Revoke
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/50 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Irreversible actions for your account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                                <div>
                                    <p className="font-medium">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete your account and all data.
                                    </p>
                                </div>
                                <Button variant="destructive">Delete Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
