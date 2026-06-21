"use client";

import { useState } from "react";
import { Button } from "@/components/core/ui/button";
import { Sparkles } from "lucide-react";
import { TemplateLibrary as CreativeTemplateLibrary } from "@/views/Growth/CreativeStudio/creatives/_components/templates/TemplateLibrary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";

export default function TemplateLibrary() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Template Library
                </CardTitle>
                <CardDescription>
                    Access over 50+ viral scripts and content frameworks
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-lg border-2 border-dashed">
                    <div className="p-3 bg-yellow-500/10 rounded-full mb-4">
                        <Sparkles className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Content Templates</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                        Browse our collection of high-converting scripts for TikTok, Instagram, and Facebook Ads.
                    </p>
                    <Button onClick={() => setIsOpen(true)}>
                        Open Template Library
                    </Button>
                </div>

                <CreativeTemplateLibrary
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onSelectTemplate={(template) => {
                        console.log("Selected:", template);
                        setIsOpen(false);
                    }}
                />
            </CardContent>
        </Card>
    );
}
