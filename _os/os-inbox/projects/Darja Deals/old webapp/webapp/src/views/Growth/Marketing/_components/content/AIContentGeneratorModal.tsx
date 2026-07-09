"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/core/ui/dialog';
import { Button } from '@/components/core/ui/button';
import { Textarea } from '@/components/core/ui/textarea';
import { Label } from '@/components/core/ui/label';
import { Sparkles, Loader2, Check, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface AIGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (text: string) => void;
}

export function AIContentGeneratorModal({ isOpen, onClose, onInsert }: AIGeneratorProps) {
    const [prompt, setPrompt] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generate = () => {
        if (!prompt) return;
        setIsLoading(true);

        // Mock AI generation
        setTimeout(() => {
            const mockResponses = [
                "Here is a compelling introduction for your article. It captures the reader's attention immediately and sets the tone for the rest of the piece.",
                "Discover the secrets to boosting your productivity with these 5 simple tips. You'll be amazed at how much more you can get done in less time.",
                "Our new product is designed to revolutionize the way you work. With its intuitive interface and powerful features, you'll wonder how you ever lived without it.",
                "Thank you for your interest in our services. We are committed to providing the highest quality solutions to meet your needs."
            ];
            const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
            setOutput(randomResponse);
            setIsLoading(false);
        }, 1500);
    };

    const regenerate = () => {
        generate();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const handleInsert = () => {
        onInsert(output);
        onClose();
        setPrompt('');
        setOutput('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI Content Generator
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Describe what you want to create</Label>
                        <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="E.g., A product description for a travel backpack highlighting durability and comfort..."
                            rows={4}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={generate}
                            disabled={!prompt || isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            Generate
                        </Button>
                        <Button variant="outline" onClick={() => setPrompt('')}>
                            Clear
                        </Button>
                    </div>

                    {output && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Label>Result</Label>
                            <div className="p-4 bg-muted rounded-lg mt-2 border">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{output}</p>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Button onClick={handleInsert} className="flex-1">
                                    <Check className="h-4 w-4 mr-2" />
                                    Insert
                                </Button>
                                <Button variant="outline" onClick={regenerate}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Regenerate
                                </Button>
                                <Button variant="outline" onClick={() => copyToClipboard(output)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
