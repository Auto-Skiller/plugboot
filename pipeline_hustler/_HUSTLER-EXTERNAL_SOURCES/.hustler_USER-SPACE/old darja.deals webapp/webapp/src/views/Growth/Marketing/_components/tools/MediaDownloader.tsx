"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Badge } from "@/components/core/ui/badge";
import { Download, Link2, Video, Instagram, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Mock download history
const RECENT_DOWNLOADS = [
    { id: 1, platform: "TikTok", title: "Product Demo Video", thumbnail: "🎬", date: "Il y a 2h" },
    { id: 2, platform: "Instagram", title: "Reel - New Arrival", thumbnail: "📸", date: "Il y a 5h" },
    { id: 3, platform: "TikTok", title: "Unboxing Video", thumbnail: "🎬", date: "Hier" },
];

export default function MediaDownloader() {
    const [url, setUrl] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadReady, setDownloadReady] = useState(false);
    const [mediaInfo, setMediaInfo] = useState<{ platform: string; title: string; duration?: string } | null>(null);

    const detectPlatform = (url: string): string | null => {
        if (url.includes("tiktok.com")) return "TikTok";
        if (url.includes("instagram.com")) return "Instagram";
        if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
        if (url.includes("facebook.com") || url.includes("fb.watch")) return "Facebook";
        return null;
    };

    const handleProcess = () => {
        const platform = detectPlatform(url);
        if (!platform) {
            toast.error("URL not supported. Use TikTok, Instagram, YouTube, or Facebook.");
            return;
        }

        setIsProcessing(true);
        setDownloadReady(false);

        // Simulate processing
        setTimeout(() => {
            setMediaInfo({
                platform,
                title: `${platform} Video - Product Demo`,
                duration: "0:45"
            });
            setDownloadReady(true);
            setIsProcessing(false);
            toast.success("Media ready for download!");
        }, 2000);
    };

    const handleDownload = () => {
        toast.success("Download started! (Mock - would download actual video)");
        // In production, this would trigger actual download
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-purple-500" />
                    Media Downloader
                </CardTitle>
                <CardDescription>
                    Download videos from TikTok, Instagram, YouTube without watermarks
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* URL Input */}
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Paste video URL here..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleProcess} disabled={!url || isProcessing}>
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Process"
                            )}
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="gap-1"><Video className="h-3 w-3" /> TikTok</Badge>
                        <Badge variant="outline" className="gap-1"><Instagram className="h-3 w-3" /> Instagram</Badge>
                        <Badge variant="outline" className="gap-1">YouTube</Badge>
                        <Badge variant="outline" className="gap-1">Facebook</Badge>
                    </div>
                </div>

                {/* Download Ready */}
                {downloadReady && mediaInfo && (
                    <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium">{mediaInfo.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {mediaInfo.platform} • {mediaInfo.duration}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">HD</Button>
                                <Button size="sm" onClick={handleDownload} className="gap-2">
                                    <Download className="h-4 w-4" /> Download
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Downloads */}
                <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Recent Downloads</p>
                    <div className="space-y-2">
                        {RECENT_DOWNLOADS.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{item.thumbnail}</span>
                                    <div>
                                        <p className="text-sm font-medium">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.platform} • {item.date}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-yellow-800 dark:text-yellow-200">
                        Only download content you have rights to use. Respect creators&apos; copyrights.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
