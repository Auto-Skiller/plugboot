"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Textarea } from "@/components/core/ui/textarea";
import { ShieldAlert, ShieldCheck, Search, AlertOctagon } from "lucide-react";

const ALGOSPEAK_DICT: Record<string, string> = {
    "kill": "unalive",
    "dead": "unlived",
    "gun": "pew-pew",
    "drugs": "gardening",
    "sex": "seggs",
    "money": "doubloons",
    "protest": "outdoor gathering", // Political
    "nude": "unclad" // Adult
};

export default function ContentSafetyChecker() {
    const [text, setText] = useState("");
    const [issues, setIssues] = useState<string[]>([]);
    const [checked, setChecked] = useState(false);

    const handleCheck = () => {
        if (!text) return;
        const found = Object.keys(ALGOSPEAK_DICT).filter(word => text.toLowerCase().includes(word));
        setIssues(found);
        setChecked(true);
    };

    return (
        <Card className="h-full border-green-100 dark:border-green-900 shadow-sm">
            <CardHeader className="bg-green-50/50 dark:bg-green-950/20 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <ShieldAlert className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Safety Checker</CardTitle>
                        <CardDescription>Avoid shadowbans & algorithmic penalties</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <Textarea
                    placeholder="Paste your caption or script here..."
                    className="min-h-[120px]"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        setChecked(false);
                    }}
                />

                <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleCheck}
                    disabled={!text}
                >
                    <Search className="w-4 h-4 mr-2" /> Scan for Risks
                </Button>

                {checked && (
                    <div className={`p-4 rounded-lg border ${issues.length > 0 ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'} animate-in fade-in`}>
                        {issues.length > 0 ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-red-600 font-semibold">
                                    <AlertOctagon className="h-5 w-5" />
                                    <span>{issues.length} Risky Words Found</span>
                                </div>
                                <ul className="text-sm space-y-1">
                                    {issues.map(word => (
                                        <li key={word} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                            <span className="line-through opacity-70">{word}</span>
                                            <span className="font-medium text-green-600">→ {ALGOSPEAK_DICT[word]}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                                <ShieldCheck className="h-5 w-5" />
                                <span>No issues found. Safe to post!</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
