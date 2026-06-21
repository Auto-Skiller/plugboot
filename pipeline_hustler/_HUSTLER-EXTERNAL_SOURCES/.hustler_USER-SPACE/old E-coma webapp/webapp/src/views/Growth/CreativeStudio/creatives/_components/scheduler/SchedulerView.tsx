"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Calendar, Clock, Facebook, Instagram, Video, Image as ImageIcon, Plus, Grid, List, Filter, MoreHorizontal, Upload, Folder, Eye, Heart, Share2, Zap, TrendingUp, FileText, CheckCircle, Send } from "lucide-react";
import Image from "next/image";



// Mock Data from PostsLibrary (Merged)
const LIBRARY_ASSETS = [
    { id: 101, type: "image", name: "product-1.jpg", size: "2.4 MB", image: "/placeholder.jpg", date: "2024-06-10" },
    { id: 102, type: "video", name: "promo.mp4", size: "12.5 MB", image: "/placeholder.jpg", date: "2024-06-11" },
    { id: 103, type: "image", name: "campaign-summer.jpg", size: "3.1 MB", image: "/placeholder.jpg", date: "2024-06-12" },
    { id: 104, type: "video", name: "tutorial.mp4", size: "45.2 MB", image: "/placeholder.jpg", date: "2024-06-13" },
];

// Mock Data
const scheduledPosts = [
    {
        id: 1,
        title: "Promo Aid El Adha",
        platform: "tiktok",
        date: "2024-06-15",
        time: "18:00",
        status: "scheduled",
        thumbnail: "https://placehold.co/400x600/png?text=Promo+Aid",
        stats: { views: 0, likes: 0, shares: 0 }
    },
    {
        id: 2,
        title: "Livraison 58 Wilayas",
        platform: "facebook",
        date: "2024-06-15",
        time: "20:00",
        status: "scheduled",
        thumbnail: "https://placehold.co/400x400/png?text=Livraison+Gratuite",
        stats: { views: 0, likes: 0, shares: 0 }
    },
    {
        id: 3,
        title: "Avis Client (Oran)",
        platform: "instagram",
        date: "2024-06-16",
        time: "12:00",
        status: "draft",
        thumbnail: "https://placehold.co/400x400/png?text=Avis+Client",
        stats: { views: 0, likes: 0, shares: 0 }
    },
    // Merged "Posted" items from Library
    {
        id: 4,
        title: "Summer Launch",
        platform: "instagram",
        date: "2024-06-01",
        time: "10:00",
        status: "sent",
        thumbnail: "https://placehold.co/400x400/png?text=Summer+Launch",
        stats: { views: "1.2K", likes: "150", shares: "24" }
    },
    {
        id: 5,
        title: "Customer Review",
        platform: "facebook",
        date: "2024-06-05",
        time: "14:30",
        status: "sent",
        thumbnail: "https://placehold.co/400x400/png?text=Customer+Review",
        stats: { views: "850", likes: "45", shares: "12" }
    },
    // More Mock Data
    {
        id: 6,
        title: "Flash Sale Announcement",
        platform: "instagram",
        date: "2024-06-18",
        time: "09:00",
        status: "scheduled",
        thumbnail: "https://placehold.co/400x400/png?text=Flash+Sale",
        stats: { views: 0, likes: 0, shares: 0 }
    },
    {
        id: 7,
        title: "Behind the Scenes",
        platform: "tiktok",
        date: "2024-06-12",
        time: "16:00",
        status: "sent",
        thumbnail: "https://placehold.co/400x600/png?text=BTS",
        stats: { views: "5.4K", likes: "320", shares: "85" }
    },
    {
        id: 8,
        title: "New Collection Teaser",
        platform: "facebook",
        date: "2024-06-20",
        time: "11:00",
        status: "draft",
        thumbnail: "https://placehold.co/400x400/png?text=New+Collection",
        stats: { views: 0, likes: 0, shares: 0 }
    },
    {
        id: 9,
        title: "User Generated Content",
        platform: "instagram",
        date: "2024-06-14",
        time: "13:00",
        status: "sent",
        thumbnail: "https://placehold.co/400x400/png?text=UGC+Repost",
        stats: { views: "2.1K", likes: "180", shares: "15" }
    },
    {
        id: 10,
        title: "Weekend Vibes",
        platform: "tiktok",
        date: "2024-06-22",
        time: "10:00",
        status: "scheduled",
        thumbnail: "https://placehold.co/400x600/png?text=Weekend",
        stats: { views: 0, likes: 0, shares: 0 }
    },
    {
        id: 11,
        title: "Product Tutorial",
        platform: "facebook",
        date: "2024-06-10",
        time: "15:00",
        status: "sent",
        thumbnail: "https://placehold.co/400x400/png?text=Tutorial",
        stats: { views: "1.5K", likes: "95", shares: "40" }
    }
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [10, 11, 12, 13, 14, 15, 16]; // Mock week

export default function SchedulerPage() {
    const [posts, setPosts] = useState(scheduledPosts);
    const [assets, setAssets] = useState(LIBRARY_ASSETS);
    const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'grid'>('calendar');
    const [activeTab, setActiveTab] = useState<'all' | 'queue' | 'drafts' | 'sent' | 'approvals' | 'assets'>('all');

    // Filter posts based on active tab
    const filteredPosts = posts.filter(post => {
        if (activeTab === 'all') return true;
        if (activeTab === 'queue') return post.status === 'scheduled';
        if (activeTab === 'drafts') return post.status === 'draft';
        if (activeTab === 'sent') return post.status === 'sent';
        return true;
    });

    // Determine if we are in Assets view
    const isAssetsView = activeTab === 'assets';

    return (
        <div className="space-y-8 p-8 bg-white/50 dark:bg-muted/10 rounded-3xl backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Social Scheduler</h1>
                    <p className="text-muted-foreground mt-1">Plan and automate your organic content.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground hidden sm:inline-block">Timezone: <span className="font-medium text-foreground">Africa/Algiers (GMT+1)</span></span>

                </div>
            </div>

            {/* Tabs & View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-4 gap-4">
                <div className="flex space-x-2 sm:space-x-6 overflow-x-auto no-scrollbar">
                    {(['all', 'queue', 'drafts', 'approvals', 'sent', 'assets'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm font-medium pb-4 -mb-4 border-b-2 transition-all capitalize flex items-center gap-2 ${activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                }`}
                        >
                            {tab}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                                }`}>
                                {tab === 'assets' ? assets.length : posts.filter(p =>
                                    tab === 'all' ? true :
                                        tab === 'queue' ? p.status === 'scheduled' :
                                            tab === 'drafts' ? p.status === 'draft' :
                                                tab === 'sent' ? p.status === 'sent' : false
                                ).length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {isAssetsView && (
                        <Button size="sm" variant="outline" className="gap-2 hidden sm:flex">
                            <Upload className="h-4 w-4" />
                            Upload Asset
                        </Button>
                    )}
                    <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                        {!isAssetsView && (
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`p-2 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Calendar View"
                            >
                                <Calendar className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        {isAssetsView && (
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Grid View"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>



            {/* Calendar View (Only for Posts) */}
            {!isAssetsView && viewMode === 'calendar' && (
                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="flex flex-row items-center justify-between px-0 pt-0">
                        <CardTitle className="flex items-center text-xl">
                            <Calendar className="mr-2 h-5 w-5 text-primary" /> June 2024
                        </CardTitle>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="bg-background/50">Week View</Button>
                            <Button variant="ghost" size="sm">Month View</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="grid grid-cols-7 gap-4 text-center mb-4">
                            {days.map(day => (
                                <div key={day} className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {dates.map((date, index) => {
                                const currentDate = `2024-06-${date}`;
                                const dayPosts = filteredPosts.filter(p => p.date === currentDate);
                                const isToday = date === 15; // Mock "Today"

                                return (
                                    <div key={date} className={`border rounded-2xl p-3 relative transition-all duration-300 min-h-[180px] flex flex-col ${isToday
                                        ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)]'
                                        : 'bg-background/50 border-border/50 hover:border-border hover:bg-background/80'
                                        }`}>
                                        <div className={`text-right text-sm font-bold mb-2 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {date}
                                        </div>

                                        <div className="space-y-2 flex-1">
                                            {dayPosts.map(post => (
                                                <div key={post.id} className="bg-white dark:bg-card border border-border/50 rounded-xl text-left shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all group/post relative overflow-hidden flex flex-col">
                                                    {/* Cover Image */}
                                                    <div className="relative h-24 w-full bg-muted overflow-hidden">
                                                        <Image src={post.thumbnail} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover/post:scale-105" unoptimized />

                                                        {/* Platform Icon (Top Right) */}
                                                        <div className="absolute top-1.5 right-1.5 bg-black/20 backdrop-blur-md p-1 rounded-full text-white">
                                                            {post.platform === 'tiktok' && <Video className="h-3 w-3" />}
                                                            {post.platform === 'facebook' && <Facebook className="h-3 w-3" />}
                                                            {post.platform === 'instagram' && <Instagram className="h-3 w-3" />}
                                                        </div>

                                                        {/* Status Badge (Top Left) */}
                                                        <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider backdrop-blur-md ${post.status === 'scheduled' ? 'bg-green-500/80 text-white' :
                                                            post.status === 'draft' ? 'bg-yellow-500/80 text-white' :
                                                                'bg-blue-500/80 text-white'
                                                            }`}>
                                                            {post.status}
                                                        </div>

                                                        {/* Play Button Overlay (Video) */}
                                                        {(post.platform === 'tiktok') && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/post:bg-black/20 transition-colors">
                                                                <div className="w-6 h-6 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50">
                                                                    <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-2 flex flex-col gap-1.5">
                                                        <div className="text-xs font-semibold truncate text-foreground/90 group-hover/post:text-primary transition-colors leading-tight">{post.title}</div>

                                                        {post.status === 'sent' ? (
                                                            <div className="flex items-center justify-between pt-1 border-t border-border/50">
                                                                <div className="flex items-center gap-1 text-[9px] text-muted-foreground" title="Views">
                                                                    <Eye className="h-2.5 w-2.5" /> {post.stats.views}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-[9px] text-muted-foreground" title="Likes">
                                                                    <Heart className="h-2.5 w-2.5" /> {post.stats.likes}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                <Clock className="h-3 w-3" /> {post.time}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Add Slot Placeholder */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute bottom-2 right-2 scale-90 group-hover:scale-100">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* List View (Posts) */}
            {
                !isAssetsView && viewMode === 'list' && (
                    <div className="space-y-4">
                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                    <Calendar className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium">No posts in this view.</p>
                                <Button variant="link" className="text-primary mt-2">Create a post</Button>
                            </div>
                        ) : (
                            filteredPosts.map((post) => (
                                <div key={post.id} className="bg-white dark:bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex items-center gap-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
                                    <div className="relative w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 shadow-inner">
                                        <Image src={post.thumbnail} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{post.title}</h3>
                                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${post.status === 'scheduled' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                }`}>
                                                {post.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2 bg-muted/30 px-2 py-1 rounded-md">
                                                {post.platform === 'tiktok' && <Video className="h-4 w-4" />}
                                                {post.platform === 'facebook' && <Facebook className="h-4 w-4 text-blue-600" />}
                                                {post.platform === 'instagram' && <Instagram className="h-4 w-4 text-pink-600" />}
                                                <span className="capitalize font-medium">{post.platform}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4 text-primary/70" />
                                                <span>{post.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-primary/70" />
                                                <span>{post.time}</span>
                                            </div>
                                            {post.status === 'sent' && (
                                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border/50">
                                                    <div className="flex items-center gap-1.5" title="Views">
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium text-foreground">{post.stats.views}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5" title="Likes">
                                                        <Heart className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium text-foreground">{post.stats.likes}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5" title="Shares">
                                                        <Share2 className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium text-foreground">{post.stats.shares}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-all">Edit</Button>
                                </div>
                            ))
                        )}
                    </div>
                )
            }

            {/* Assets View (Grid/List) */}
            {
                isAssetsView && (
                    <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                        {assets.map((asset) => (
                            <div
                                key={asset.id}
                                className={`group relative border border-transparent hover:border-purple-500/30 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer bg-background/80 hover:bg-background hover:shadow-lg hover:-translate-y-1 ${viewMode === 'list' ? 'flex items-center gap-4 p-3 border-border/50' : ''
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div className={`${viewMode === 'list' ? 'h-16 w-16 rounded-lg' : 'aspect-square w-full'} bg-muted/50 flex items-center justify-center text-muted-foreground relative overflow-hidden`}>
                                    <ImageIcon className="h-8 w-8 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                    {asset.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg group-hover:scale-110 transition-transform">
                                                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className={`p-3 ${viewMode === 'list' ? 'flex-1 flex justify-between items-center p-0' : ''}`}>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate group-hover:text-purple-600 transition-colors">{asset.name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                            <span>{asset.size}</span>
                                            <span className="text-muted-foreground/40">•</span>
                                            <span>{asset.date}</span>
                                        </p>
                                    </div>
                                    {viewMode === 'list' && (
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-all">Download</Button>
                                            <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-all">Use</Button>
                                        </div>
                                    )}
                                </div>

                                {/* Hover Actions (Grid) */}
                                {viewMode !== 'list' && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                                        <Button size="sm" variant="secondary" className="h-8 px-3 text-xs font-semibold hover:scale-105 transition-transform">
                                            Use Asset
                                        </Button>
                                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full hover:scale-105 transition-transform">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            }
        </div>
    );
}
