"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useAuth, UserProfile } from "@/components/core/layout/AuthProvider";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleMockLogin = (role: 'admin' | 'team') => {
        setIsLoading(true);

        const mockProfile: UserProfile = role === 'admin' ? {
            name: "Admin User",
            email: "admin@ecoma.com",
            role: "admin",
            businessName: "My E-Commerce Empire",
            industry: "Retail"
        } : {
            name: "Team Member",
            email: "team@ecoma.com",
            role: "team",
            businessName: "My E-Commerce Empire",
            industry: "Retail"
        };

        login(mockProfile);

        // Redirect based on role
        if (role === 'admin') {
            window.location.href = "/admin/general";
        } else {
            window.location.href = "/hub";
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Default to Admin mock for the main form
        handleMockLogin('admin');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md border-primary/20 shadow-2xl shadow-primary/5">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-2xl">R</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your store.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full" onClick={() => {
                        // Mock OAuth flow - simulates Google Login
                        setIsLoading(true);

                        // Simulate network delay
                        setTimeout(() => {
                            toast.success("Successfully logged in with Google");

                            login({
                                name: "Google User",
                                email: "user@gmail.com",
                                role: "team",
                                businessName: "Startup Inc",
                                industry: "Tech"
                            });

                            localStorage.setItem("user-provider", "google");
                            window.location.href = "/hub";
                        }, 1500);
                    }}>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Sign in with Google
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="secondary" onClick={() => handleMockLogin('admin')} disabled={isLoading} className="text-xs">
                            <Lock className="mr-2 h-3 w-3" />
                            Mock Admin
                        </Button>
                        <Button variant="secondary" onClick={() => handleMockLogin('team')} disabled={isLoading} className="text-xs">
                            <Mail className="mr-2 h-3 w-3" />
                            Mock Team
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="email" placeholder="name@example.com" className="pl-10" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="Password" className="pl-10" required />
                            </div>
                        </div>
                        <Button type="submit" className="w-full box-glow" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
