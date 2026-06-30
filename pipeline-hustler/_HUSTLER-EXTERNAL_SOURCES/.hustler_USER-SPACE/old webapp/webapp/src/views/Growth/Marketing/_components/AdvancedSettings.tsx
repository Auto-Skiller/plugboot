"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card';
import { Button } from '@/components/core/ui/button';
import { Input } from '@/components/core/ui/input';
import { Label } from '@/components/core/ui/label';
import { Switch } from '@/components/core/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/core/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/core/ui/table';
import { Badge } from '@/components/core/ui/badge';
import { Shield, Globe, Lock, Plus, Trash2 } from 'lucide-react';

export function AdvancedSettings() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        OAuth Applications
                    </CardTitle>
                    <CardDescription>Register applications to use Riglify via OAuth 2.0.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Register New App
                            </Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Application Name</TableHead>
                                    <TableHead>Client ID</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Mobile App Integration</TableCell>
                                    <TableCell><code className="bg-muted px-2 py-1 rounded text-xs">client_8x92...</code></TableCell>
                                    <TableCell>1,240</TableCell>
                                    <TableCell className="text-muted-foreground">Oct 12, 2024</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Rate Limiting
                        </CardTitle>
                        <CardDescription>Configure API request limits to prevent abuse.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Enable Rate Limiting</Label>
                                <p className="text-sm text-muted-foreground">Enforce limits on all API keys</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                            <div className="grid gap-2">
                                <Label>Requests per minute</Label>
                                <Input type="number" defaultValue="60" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Requests per hour</Label>
                                <Input type="number" defaultValue="1000" />
                            </div>
                            <Button className="w-full">Save Limits</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            IP Whitelisting
                        </CardTitle>
                        <CardDescription>Restrict API access to specific IP addresses.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Enable IP Whitelist</Label>
                                <p className="text-sm text-muted-foreground">Only allow requests from listed IPs</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex gap-2">
                                <Input placeholder="192.168.1.1" />
                                <Button size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 border rounded bg-muted/50">
                                    <span className="font-mono text-sm">10.0.0.5</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between p-2 border rounded bg-muted/50">
                                    <span className="font-mono text-sm">172.16.0.0/12</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
