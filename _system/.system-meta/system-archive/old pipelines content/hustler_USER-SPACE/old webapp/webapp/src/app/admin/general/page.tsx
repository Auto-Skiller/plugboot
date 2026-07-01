"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Settings, User, Building2, Globe, Bell, Palette } from "lucide-react";
import { useAuth } from "@/components/core/layout/AuthProvider";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/core/ui/dialog";

export default function GeneralSettingsPage() {
    const { user, updateProfile } = useAuth();

    // Edit Profile State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: "", email: "" });

    // Edit Business State
    const [isBusinessOpen, setIsBusinessOpen] = useState(false);
    const [businessForm, setBusinessForm] = useState({ businessName: "", industry: "" });

    const handleEditProfile = () => {
        setProfileForm({ name: user?.name || "", email: user?.email || "" });
        setIsProfileOpen(true);
    };

    const handleSaveProfile = () => {
        updateProfile({ name: profileForm.name, email: profileForm.email });
        setIsProfileOpen(false);
    };

    const handleEditBusiness = () => {
        setBusinessForm({ businessName: user?.businessName || "", industry: user?.industry || "" });
        setIsBusinessOpen(true);
    };

    const handleSaveBusiness = () => {
        updateProfile({ businessName: businessForm.businessName, industry: businessForm.industry });
        setIsBusinessOpen(false);
    };

    if (!user) return null; // Or loading spinner

    return (
        <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile
                        </CardTitle>
                        <CardDescription>Your personal account settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleEditProfile}>Edit Profile</Button>
                    </CardContent>
                </Card>

                {/* Business Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Business
                        </CardTitle>
                        <CardDescription>Your business information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Business Name</span>
                                <span className="text-sm font-medium">{user.businessName || "Not set"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Industry</span>
                                <span className="text-sm font-medium">{user.industry || "Not set"}</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleEditBusiness}>Edit Business Info</Button>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Configure your notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Email notifications</span>
                                <span className="text-sm text-green-500">Enabled</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Push notifications</span>
                                <span className="text-sm text-green-500">Enabled</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize your interface</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Theme</span>
                                <span className="text-sm font-medium">Dark</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Language</span>
                                <span className="text-sm font-medium">English</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Profile Edit Dialog */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your personal information.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profileForm.email}
                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveProfile}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Business Edit Dialog */}
            <Dialog open={isBusinessOpen} onOpenChange={setIsBusinessOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Business Info</DialogTitle>
                        <DialogDescription>Update your business details.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input
                                id="businessName"
                                value={businessForm.businessName}
                                onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry/Niche</Label>
                            <Input
                                id="industry"
                                value={businessForm.industry}
                                onChange={(e) => setBusinessForm({ ...businessForm, industry: e.target.value })}
                                placeholder="e.g. Fashion, Electronics"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBusinessOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveBusiness}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
