'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Slider } from "@/components/core/ui/slider";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import { Textarea } from "@/components/core/ui/textarea";
import { Button } from "@/components/core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/core/ui/table";
import { Plus, X, Sparkles, MessageSquare, AlertCircle, Copy, Check, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/core/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/core/ui/tooltip";

export default function BrandVoiceProfile() {
    // Profile State
    const [currentProfile, setCurrentProfile] = useState("default");

    // Voice Sliders State (50 is neutral)
    const [formalCasual, setFormalCasual] = useState([50]);
    const [boldSoft, setBoldSoft] = useState([50]);
    const [funnySerious, setFunnySerious] = useState([50]);

    // Words List State
    const [wordToUse, setWordToUse] = useState("");
    const [wordsToUseList, setWordsToUseList] = useState<string[]>(["Premium", "Authentic"]);
    const [wordToAvoid, setWordToAvoid] = useState("");
    const [wordsToAvoidList, setWordsToAvoidList] = useState<string[]>(["Cheap", "Boring"]);

    // Example Caption
    const [exampleCaption, setExampleCaption] = useState("Discover the elegance of our new summer collection. Handcrafted for those who value quality. #SummerVibes");

    const addWordToUse = () => {
        if (wordToUse.trim() && !wordsToUseList.includes(wordToUse.trim())) {
            setWordsToUseList([...wordsToUseList, wordToUse.trim()]);
            setWordToUse("");
        }
    };

    const addWordToAvoid = () => {
        if (wordToAvoid.trim() && !wordsToAvoidList.includes(wordToAvoid.trim())) {
            setWordsToAvoidList([...wordsToAvoidList, wordToAvoid.trim()]);
            setWordToAvoid("");
        }
    };

    const removeWordToUse = (word: string) => {
        setWordsToUseList(wordsToUseList.filter(w => w !== word));
    };

    const removeWordToAvoid = (word: string) => {
        setWordsToAvoidList(wordsToAvoidList.filter(w => w !== word));
    };

    return (
        <Card className="h-full border-2 border-purple-100 dark:border-purple-900/30 bg-card/50">
            <CardHeader className="pb-4 bg-purple-50/50 dark:bg-purple-900/10 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Brand Voice Profile</CardTitle>
                            <CardDescription>Define how your brand speaks to its audience</CardDescription>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Active Profile:</span>
                        <Select value={currentProfile} onValueChange={setCurrentProfile}>
                            <SelectTrigger className="w-[180px] h-9">
                                <SelectValue placeholder="Select profile" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Main Brand Voice</SelectItem>
                                <SelectItem value="sales">Sales & Promo</SelectItem>
                                <SelectItem value="support">Customer Support</SelectItem>
                                <SelectItem value="ceo">CEO / Personal</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
                <Tabs defaultValue="settings" className="w-full">
                    <div className="border-b px-4 bg-muted/20">
                        <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
                            <TabsTrigger 
                                value="settings" 
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-0 font-medium"
                            >
                                Voice Settings
                            </TabsTrigger>
                            <TabsTrigger 
                                value="matrix" 
                                className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-0 font-medium"
                            >
                                Context Matrix
                                <Badge variant="secondary" className="ml-2 h-5 text-[10px] px-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                    New
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="settings" className="p-6 space-y-8 mt-0">
                         {/* Voice Tone Sliders */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                                    Tone & Style
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Adjust the sliders to match your brand's personality.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </h3>
                                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground">
                                    Reset to Default
                                </Button>
                            </div>
                            
                            {/* Formal <-> Casual */}
                            <div className="grid grid-cols-[100px_1fr_100px] gap-4 items-center">
                                <span className="text-sm font-medium text-right text-muted-foreground">Formal</span>
                                <Slider 
                                    value={formalCasual} 
                                    onValueChange={setFormalCasual} 
                                    max={100} 
                                    step={1} 
                                    className="[&>.bg-primary]:bg-purple-600"
                                />
                                <span className="text-sm font-medium text-left text-foreground">Casual</span>
                            </div>

                            {/* Bold <-> Soft */}
                            <div className="grid grid-cols-[100px_1fr_100px] gap-4 items-center">
                                <span className="text-sm font-medium text-right text-muted-foreground">Bold</span>
                                <Slider 
                                    value={boldSoft} 
                                    onValueChange={setBoldSoft} 
                                    max={100} 
                                    step={1}
                                    className="[&>.bg-primary]:bg-purple-600"
                                />
                                <span className="text-sm font-medium text-left text-foreground">Soft</span>
                            </div>

                            {/* Serious <-> Funny */}
                            <div className="grid grid-cols-[100px_1fr_100px] gap-4 items-center">
                                <span className="text-sm font-medium text-right text-muted-foreground">Serious</span>
                                <Slider 
                                    value={funnySerious} 
                                    onValueChange={setFunnySerious} 
                                    max={100} 
                                    step={1}
                                    className="[&>.bg-primary]:bg-purple-600"
                                />
                                <span className="text-sm font-medium text-left text-foreground">Funny</span>
                            </div>
                        </div>

                        <div className="border-t border-border/50" />

                        {/* Vocabulary Guide */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Words to Use */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                    <MessageSquare className="w-4 h-4" />
                                    Words to Use
                                </div>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Add word..." 
                                        value={wordToUse}
                                        onChange={(e) => setWordToUse(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addWordToUse()}
                                        className="h-9"
                                    />
                                    <Button size="sm" variant="outline" onClick={addWordToUse} className="px-3">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-muted/10 rounded-md border border-dashed border-muted-foreground/20">
                                    {wordsToUseList.length === 0 && <span className="text-xs text-muted-foreground italic">No words added yet</span>}
                                    {wordsToUseList.map(word => (
                                        <Badge key={word} variant="outline" className="bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 flex gap-1 items-center pr-1">
                                            {word}
                                            <X className="w-3 h-3 cursor-pointer hover:text-green-900" onClick={() => removeWordToUse(word)} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Words to Avoid */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                                    <AlertCircle className="w-4 h-4" />
                                    Words to Avoid
                                </div>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Add word..." 
                                        value={wordToAvoid}
                                        onChange={(e) => setWordToAvoid(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addWordToAvoid()}
                                        className="h-9"
                                    />
                                    <Button size="sm" variant="outline" onClick={addWordToAvoid} className="px-3">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-muted/10 rounded-md border border-dashed border-muted-foreground/20">
                                    {wordsToAvoidList.length === 0 && <span className="text-xs text-muted-foreground italic">No words added yet</span>}
                                    {wordsToAvoidList.map(word => (
                                        <Badge key={word} variant="outline" className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 flex gap-1 items-center pr-1">
                                            {word}
                                            <X className="w-3 h-3 cursor-pointer hover:text-red-900" onClick={() => removeWordToAvoid(word)} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border/50" />

                        {/* Example Caption */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">Ideal Caption Example</h3>
                                <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                                    <Copy className="w-3 h-3" /> Copy
                                </Button>
                            </div>
                             <p className="text-xs text-muted-foreground">Paste a caption that perfectly captures your brand voice. This helps the AI understand your style.</p>
                             <Textarea 
                                value={exampleCaption}
                                onChange={(e) => setExampleCaption(e.target.value)}
                                className="min-h-[100px] resize-none bg-muted/20 focus:bg-background transition-colors"
                             />
                        </div>
                    </TabsContent>

                    <TabsContent value="matrix" className="p-0 mt-0">
                        <div className="p-6">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[200px]">Goal / Content Type</TableHead>
                                            <TableHead>Voice Requirement</TableHead>
                                            <TableHead>Recommended Tone</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Testimonial Ad</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Strict</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">Authentic, Soft, Trusting</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Trend Post (Viral)</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Flexible</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">Casual, Funny, Bold</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Product Launch</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Brand Aligned</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">Bold, Premium, Exciting</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Educational / Tips</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Neutral</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">Helpful, Clear, Professional</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                * The Matrix defines how strictly the brand voice is applied to different content goals. 
                                "Strict" forces the AI to adhere closely to the "Words to Use" and tone settings.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
