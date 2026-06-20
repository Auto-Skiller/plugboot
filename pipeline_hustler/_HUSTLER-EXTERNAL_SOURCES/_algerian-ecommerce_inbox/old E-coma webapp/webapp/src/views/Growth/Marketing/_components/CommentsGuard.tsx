"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Badge } from "@/components/core/ui/badge";
import { Switch } from "@/components/core/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { Shield, Plus, X, AlertTriangle, CheckCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_NEGATIVE_KEYWORDS = ["خايب", "غش", "نصاب", "مزور", "terrible", "arnaque", "fake"];
const DEFAULT_DARJA_INSULTS = ["يا الكلب", "يا الحمار", "تفو عليك", "كذاب"];
const DEFAULT_COMPETITORS = ["@competitor1", "@competitor2"];
const DEFAULT_SPAM_PATTERNS = ["bit.ly/", "click here", "FREE!!!", "💰💰💰", "DM for price", "🔥🔥🔥🔥🔥"];

export function CommentsGuard() {
    const [enabled, setEnabled] = useState(true);
    const [negativeKeywords, setNegativeKeywords] = useState(DEFAULT_NEGATIVE_KEYWORDS);
    const [darjaInsults, setDarjaInsults] = useState(DEFAULT_DARJA_INSULTS);
    const [competitors, setCompetitors] = useState(DEFAULT_COMPETITORS);
    const [spamPatterns, setSpamPatterns] = useState(DEFAULT_SPAM_PATTERNS);
    const [newKeyword, setNewKeyword] = useState("");
    const [newInsult, setNewInsult] = useState("");
    const [newCompetitor, setNewCompetitor] = useState("");
    const [newSpamPattern, setNewSpamPattern] = useState("");
    const [whitelist, setWhitelist] = useState<string[]>(["@trusted_partner", "@loyal_fan"]);
    const [newWhitelist, setNewWhitelist] = useState("");
    const [action, setAction] = useState<"hide" | "delete" | "flag">("hide");

    const addKeyword = () => {
        if (newKeyword.trim()) {
            setNegativeKeywords([...negativeKeywords, newKeyword.trim()]);
            setNewKeyword("");
            toast.success("Keyword added to filter list");
        }
    };

    const addInsult = () => {
        if (newInsult.trim()) {
            setDarjaInsults([...darjaInsults, newInsult.trim()]);
            setNewInsult("");
            toast.success("Darja insult added to filter list");
        }
    };

    const addCompetitor = () => {
        if (newCompetitor.trim()) {
            setCompetitors([...competitors, newCompetitor.trim()]);
            setNewCompetitor("");
            toast.success("Competitor mention added to filter list");
        }
    };

    const removeKeyword = (keyword: string) => {
        setNegativeKeywords(negativeKeywords.filter(k => k !== keyword));
    };

    const removeInsult = (insult: string) => {
        setDarjaInsults(darjaInsults.filter(i => i !== insult));
    };

    const removeCompetitor = (competitor: string) => {
        setCompetitors(competitors.filter(c => c !== competitor));
    };

    const addSpamPattern = () => {
        if (newSpamPattern.trim()) {
            setSpamPatterns([...spamPatterns, newSpamPattern.trim()]);
            setNewSpamPattern("");
            toast.success("Spam pattern added to filter list");
        }
    };

    const removeSpamPattern = (pattern: string) => {
        setSpamPatterns(spamPatterns.filter(p => p !== pattern));
    };

    const addWhitelist = () => {
        if (newWhitelist.trim()) {
            setWhitelist([...whitelist, newWhitelist.trim()]);
            setNewWhitelist("");
            toast.success("Account added to whitelist");
        }
    };

    const removeWhitelist = (handle: string) => {
        setWhitelist(whitelist.filter(h => h !== handle));
    };

    const handleSave = () => {
        toast.success("Comments Guard settings saved!");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Comments Guard
                </h2>
                <p className="text-sm text-muted-foreground">
                    Automatically filter negative, spam, and competitor comments. Protect your brand reputation on social media.
                </p>
            </div>

            <Card className="border-blue-500/30 bg-blue-500/5">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${enabled ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}`}>
                                {enabled ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="font-semibold">Comments Guard Status</p>
                                <p className="text-xs text-muted-foreground">
                                    {enabled ? "Actively protecting your comments" : "Protection disabled"}
                                </p>
                            </div>
                        </div>
                        <Switch checked={enabled} onCheckedChange={setEnabled} />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Filter Lists */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Negative Keywords</CardTitle>
                            <CardDescription>Words that trigger automatic filtering</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add keyword..."
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                                />
                                <Button onClick={addKeyword} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {negativeKeywords.map((keyword) => (
                                    <Badge key={keyword} variant="secondary" className="gap-1 pr-1">
                                        {keyword}
                                        <button
                                            onClick={() => removeKeyword(keyword)}
                                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Darja Insults Dictionary</CardTitle>
                            <CardDescription>Algerian dialect insults to filter</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add Darja insult..."
                                    value={newInsult}
                                    onChange={(e) => setNewInsult(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addInsult()}
                                />
                                <Button onClick={addInsult} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {darjaInsults.map((insult) => (
                                    <Badge key={insult} variant="destructive" className="gap-1 pr-1">
                                        {insult}
                                        <button
                                            onClick={() => removeInsult(insult)}
                                            className="ml-1 hover:bg-red-600 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Competitor Mentions</CardTitle>
                            <CardDescription>Block mentions of competing brands</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add competitor handle..."
                                    value={newCompetitor}
                                    onChange={(e) => setNewCompetitor(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
                                />
                                <Button onClick={addCompetitor} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {competitors.map((competitor) => (
                                    <Badge key={competitor} variant="outline" className="gap-1 pr-1">
                                        {competitor}
                                        <button
                                            onClick={() => removeCompetitor(competitor)}
                                            className="ml-1 hover:bg-muted rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Spam Patterns</CardTitle>
                            <CardDescription>Detect and filter spam comments (links, repeated emojis, caps)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add spam pattern..."
                                    value={newSpamPattern}
                                    onChange={(e) => setNewSpamPattern(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addSpamPattern()}
                                />
                                <Button onClick={addSpamPattern} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {spamPatterns.map((pattern) => (
                                    <Badge key={pattern} className="gap-1 pr-1 bg-orange-500/10 text-orange-600 border-orange-500/30">
                                        {pattern}
                                        <button
                                            onClick={() => removeSpamPattern(pattern)}
                                            className="ml-1 hover:bg-orange-500/20 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-green-500" />
                                Whitelisted Accounts
                            </CardTitle>
                            <CardDescription>Accounts that bypass all automated filters</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add @handle..."
                                    value={newWhitelist}
                                    onChange={(e) => setNewWhitelist(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addWhitelist()}
                                />
                                <Button onClick={addWhitelist} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {whitelist.map((handle) => (
                                    <Badge key={handle} className="gap-1 pr-1 bg-green-500/10 text-green-600 border-green-500/30">
                                        {handle}
                                        <button
                                            onClick={() => removeWhitelist(handle)}
                                            className="ml-1 hover:bg-green-500/20 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions & Stats */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Filter Action</CardTitle>
                            <CardDescription>What to do when a violation is detected</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="action">Default Action</Label>
                                <Select value={action} onValueChange={(v) => setAction(v as any)}>
                                    <SelectTrigger id="action">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hide">Hide (Recommended)</SelectItem>
                                        <SelectItem value="delete">Delete</SelectItem>
                                        <SelectItem value="flag">Flag for Review</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="bg-muted/30 p-3 rounded-lg text-xs space-y-1">
                                <p><strong>Hide:</strong> Comment hidden from public but you can review it</p>
                                <p><strong>Delete:</strong> Permanently removes the comment</p>
                                <p><strong>Flag:</strong> Marks for manual review before action</p>
                            </div>

                            <Button onClick={handleSave} className="w-full gap-2">
                                <CheckCircle className="h-4 w-4" /> Save Settings
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Protection Stats</CardTitle>
                            <CardDescription>Last 30 days (Mock data)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30">
                                    <p className="text-xs text-muted-foreground mb-1">Blocked Comments</p>
                                    <p className="text-2xl font-bold text-red-600">127</p>
                                </div>
                                <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30">
                                    <p className="text-xs text-muted-foreground mb-1">Competitor Mentions</p>
                                    <p className="text-2xl font-bold text-yellow-600">34</p>
                                </div>
                                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
                                    <p className="text-xs text-muted-foreground mb-1">Spam Filtered</p>
                                    <p className="text-2xl font-bold text-blue-600">89</p>
                                </div>
                                <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                                    <p className="text-xs text-muted-foreground mb-1">Clean Comments</p>
                                    <p className="text-2xl font-bold text-green-600">2,456</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-500/30 bg-yellow-500/5">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">
                                <strong className="text-foreground">Note:</strong> Manual whitelist available for friendly accounts. Comments from whitelisted users bypass all filters.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
