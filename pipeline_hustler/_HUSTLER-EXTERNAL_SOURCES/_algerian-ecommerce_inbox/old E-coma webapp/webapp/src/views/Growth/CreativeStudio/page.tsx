"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import { Edit3, FileVideo, LayoutTemplate, Palette, Share2, Video, Download, DollarSign } from "lucide-react";
import { LogoWatermark } from "@/views/Growth/CreativeStudio/_components/logo-watermark";

// Import integrated components
import MultiContentGenerator from "@/views/Growth/CreativeStudio/creatives/_components/MultiContentGenerator";
import AIMediaEditor from "@/views/Growth/CreativeStudio/creatives/_components/AIMediaEditor";
import { TemplateLibrary } from "@/views/Growth/CreativeStudio/creatives/_components/templates/TemplateLibrary";
import { ContentKanban } from "@/views/Growth/CreativeStudio/creatives/_components/kanban/ContentKanban";
import MediaDownloader from "@/views/Growth/Marketing/_components/tools/MediaDownloader";
import TikTokMonetizationWizard from "@/views/Growth/CreativeStudio/creatives/_components/TikTokMonetizationWizard";
import { UGCServiceBanner } from "@/views/Growth/Marketing/_components/UGCServiceBanner";

export default function CreativeStudioPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Palette className="h-6 w-6 text-purple-500" />
                    </div>
                    Studio Créatif (Creative Studio)
                </h1>
                <p className="text-muted-foreground mt-1">
                    AI Content Creation, Templates, and TikTok Tools
                </p>
            </div>

            <Tabs defaultValue="ai-copywriter" className="space-y-6">
                <TabsList className="grid w-full max-w-5xl grid-cols-6">
                    <TabsTrigger value="ai-copywriter" className="gap-2">
                        <Edit3 className="h-4 w-4" /> AI Copy
                    </TabsTrigger>
                    <TabsTrigger value="media-editor" className="gap-2">
                        <FileVideo className="h-4 w-4" /> AI Editor
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="gap-2">
                        <LayoutTemplate className="h-4 w-4" /> Templates
                    </TabsTrigger>
                    <TabsTrigger value="content-kanban" className="gap-2">
                        <Share2 className="h-4 w-4" /> Pipeline
                    </TabsTrigger>
                    <TabsTrigger value="tiktok-tools" className="gap-2">
                        <Video className="h-4 w-4" /> TikTok
                    </TabsTrigger>
                    <TabsTrigger value="ugc-network" className="gap-2">
                        <Share2 className="h-4 w-4" /> UGC
                    </TabsTrigger>
                </TabsList>

                {/* AI Copywriter - Main content generator */}
                <TabsContent value="ai-copywriter">
                    <MultiContentGenerator />
                </TabsContent>

                {/* AI Media Editor - Video/Image editing tools */}
                <TabsContent value="media-editor">
                    <AIMediaEditor />
                </TabsContent>

                {/* Template Library - Saved templates */}
                <TabsContent value="templates">
                    <TemplateLibrary variant="inline" />
                </TabsContent>

                {/* Content Pipeline - Kanban board */}
                <TabsContent value="content-kanban">
                    <ContentKanban />
                </TabsContent>

                {/* TikTok Tools - Combined tools view */}
                <TabsContent value="tiktok-tools">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <MediaDownloader />
                            <TikTokMonetizationWizard />
                        </div>
                    </div>
                </TabsContent>

                {/* UGC Network - Service request banner */}
                <TabsContent value="ugc-network">
                    <UGCServiceBanner />
                </TabsContent>
            </Tabs>
            <LogoWatermark />
        </div>
    );
}
