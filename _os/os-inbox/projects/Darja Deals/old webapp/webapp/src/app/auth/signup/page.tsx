"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Mail, Lock, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("free");

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate Signup
        setTimeout(() => {
            setIsLoading(false);
            window.location.href = "/";
        }, 1000);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 py-12">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">

                {/* Left Side: Plan Selection */}
                <div className="space-y-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-glow">Join Riglify</h1>
                        <p className="text-muted-foreground mt-2">Start your e-commerce journey with the right tools.</p>
                    </div>

                    <div className="grid gap-4">
                        <div
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === 'free' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                            onClick={() => setSelectedPlan('free')}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold">Free Tier</h3>
                                {selectedPlan === 'free' && <Check className="h-5 w-5 text-primary" />}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Perfect for testing the waters.</p>
                            <ul className="mt-2 text-xs space-y-1 text-muted-foreground">
                                <li>• 5 Products Limit</li>
                                <li>• Basic Analytics</li>
                                <li>• Manual Orders</li>
                            </ul>
                        </div>

                        <div
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === 'tajer' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                            onClick={() => setSelectedPlan('tajer')}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-secondary">Tajer Plan</h3>
                                {selectedPlan === 'tajer' && <Check className="h-5 w-5 text-primary" />}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">For growing businesses.</p>
                            <ul className="mt-2 text-xs space-y-1 text-muted-foreground">
                                <li>• Unlimited Products</li>
                                <li>• Anti-Return Protocol</li>
                                <li>• Priority Support</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <Card className="border-primary/20 shadow-2xl shadow-primary/5 h-fit">
                    <CardHeader>
                        <CardTitle>Create Account</CardTitle>
                        <CardDescription>
                            Sign up for the <span className="font-bold text-primary uppercase">{selectedPlan}</span> plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full" onClick={() => {
                            const btn = document.activeElement as HTMLButtonElement;
                            setIsLoading(true);

                            setTimeout(() => {
                                toast.success("Successfully signed up with Google");
                                // Set mock session
                                document.cookie = "mock-session=true; path=/";
                                localStorage.setItem("system-mode", "TEAM");
                                localStorage.setItem("user-plan", selectedPlan);
                                localStorage.setItem("user-provider", "google");
                                window.location.href = "/hub";
                            }, 1500);
                        }}>
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign up with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Input placeholder="First Name" required />
                                </div>
                                <div className="space-y-2">
                                    <Input placeholder="Last Name" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input type="email" placeholder="name@example.com" className="pl-10" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input type="password" placeholder="Create Password" className="pl-10" required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full box-glow" disabled={isLoading}>
                                {isLoading ? "Creating Account..." : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <div className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
