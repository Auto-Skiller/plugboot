'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Slider } from "@/components/core/ui/slider";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import { Textarea } from "@/components/core/ui/textarea";
import { Button } from "@/components/core/ui/button";
import { Plus, X, Sparkles, MessageSquare, AlertCircle } from "lucide-react";

export default function BrandVoice() {
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
        <Card className="h-full border-2 border-purple-100 dark:border-purple-900/30">
            <CardHeader className="pb-4 bg-purple-50/50 dark:bg-purple-900/10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Brand Voice Profile</CardTitle>
                        <CardDescription>Define how your brand speaks to its audience</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
                {/* Voice Tone Sliders */}
                <div className="space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tone & Style</h3>
                    
                    {/* Formal <-> Casual */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Formal</span>
                            <span className="text-muted-foreground">Neutral</span>
                            <span>Casual</span>
                        </div>
                        <Slider 
                            value={formalCasual} 
                            onValueChange={setFormalCasual} 
                            max={100} 
                            step={1} 
                            className="[&>.bg-primary]:bg-purple-600"
                        />
                    </div>

                    {/* Bold <-> Soft */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Bold & Aggressive</span>
                            <span className="text-muted-foreground">Neutral</span>
                            <span>Soft & Empathetic</span>
                        </div>
                        <Slider 
                            value={boldSoft} 
                            onValueChange={setBoldSoft} 
                            max={100} 
                            step={1}
                            className="[&>.bg-primary]:bg-purple-600"
                        />
                    </div>

                    {/* Serious <-> Funny */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Serious</span>
                            <span className="text-muted-foreground">Neutral</span>
                            <span>Funny & Witty</span>
                        </div>
                        <Slider 
                            value={funnySerious} 
                            onValueChange={setFunnySerious} 
                            max={100} 
                            step={1}
                            className="[&>.bg-primary]:bg-purple-600"
                        />
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
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
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
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
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
                     <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ideal Caption Example</h3>
                     <p className="text-xs text-muted-foreground">Paste a caption that perfectly captures your brand voice.</p>
                     <Textarea 
                        value={exampleCaption}
                        onChange={(e) => setExampleCaption(e.target.value)}
                        className="min-h-[100px] resize-none bg-muted/20 focus:bg-background transition-colors"
                     />
                </div>
            </CardContent>
        </Card>
    );
}
