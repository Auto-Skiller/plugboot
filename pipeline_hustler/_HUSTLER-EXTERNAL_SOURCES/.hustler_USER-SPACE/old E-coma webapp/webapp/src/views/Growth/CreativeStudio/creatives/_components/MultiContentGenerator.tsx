"use client";

import React, { useMemo, useRef, useState } from "react";
import {
    Sparkles, Zap, Layout, Image as ImageIcon, Video, Type,
    Instagram, Facebook, Youtube, Music2, Share2, Download,
    RefreshCw, Wand2, Check, Copy, Settings, Calendar,
    MoreHorizontal, ChevronDown, ChevronRight, X, Play,
    ShoppingBag, Heart, MessageSquare, Layers, Lightbulb,
    Palette, Smartphone, MonitorPlay, MousePointer2, Globe, Target,
    AlertTriangle, Shield
} from "lucide-react";
import { Card } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Textarea } from "@/components/core/ui/textarea";
import { Badge } from "@/components/core/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/core/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/core/ui/tabs";
import { Slider } from "@/components/core/ui/slider";
import { Progress } from "@/components/core/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/core/ui/collapsible";
import { cn } from "@/lib/utils";
import { QualityChecklist } from "./QualityChecklist";

// --- Types & Interfaces ---

type ContentGoal = 'product_launch' | 'ad' | 'ugc' | 'post';
type ContentFormat = 'image' | 'reel' | 'story' | 'text';
type PlatformId = 'Instagram' | 'Facebook' | 'TikTok' | 'YouTube';
type CreationMode = 'manual' | 'hybrid' | 'auto';
type FunnelStage = 'awareness' | 'consideration' | 'conversion';
type ActionType = 'dm' | 'click' | 'comment' | 'purchase' | 'share';

type ContextFieldId =
    | 'product'
    | 'targetAudience'
    | 'offer'
    | 'constraints'
    | 'usp'
    | 'proof'
    | 'brandVoice'
    | 'cta'
    | 'objections'
    | 'price'
    | 'shipping'
    | 'testimonials'
    | 'painPoints'
    | 'voiceSliders'
    | 'wordsToUse'
    | 'wordsToAvoid'
    | 'exampleCaption';

type ContextBlockId =
    | 'audience'
    | 'offer'
    | 'usp'
    | 'proof'
    | 'voice'
    | 'cta'
    | 'constraints';

interface ContextFieldSpec {
    id: ContextFieldId;
    label: string;
    helperText?: string;
    whyThisMatters?: string;
    placeholder?: string;
    examples?: string[];
    kind: 'text' | 'textarea' | 'chips' | 'slider-group';
    /** If kind === 'chips', allows multiple values */
    multiple?: boolean;
    /** Optional quick suggestions */
    suggestions?: string[];
    /** For slider-group */
    sliders?: { id: string; left: string; right: string }[];
}

interface ContextBlockSpec {
    id: ContextBlockId;
    title: string;
    priority: 'required' | 'recommended' | 'optional';
    helperText?: string;
    whyThisMatters?: string;
    fields: ContextFieldSpec[];
}

interface ComboContextSpec {
    requiredContext: ContextFieldId[];
    niceToHave: ContextFieldId[];
    contextBlocks: ContextBlockSpec[];
}

interface ProductConfig {
    name: string;
    description: string;
    url: string;
    cloneUrl: string;
}

interface QuickPreset {
    id: string;
    label: string;
    icon: any;
    goal: ContentGoal;
    format: ContentFormat;
    tag: { label: string; bgColor: string; textColor: string };
    platforms: PlatformId[];
    shimmer?: boolean;
    defaults: {
        tone: string;
        ctaStyle: string;
        structure: string;
        funnelStage?: FunnelStage;
        actionType?: ActionType;
    };
}

// AI Tips for each GoalÃ—Format combination
interface AITip {
    headline: string;
    tips: string[];
}

// --- Constants & Matrices ---

const CONTENT_GOALS: { id: ContentGoal; label: string; icon: any; color: string; bg: string }[] = [
    { id: 'product_launch', label: 'Product Launch', icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { id: 'ad', label: 'Ad Creative', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { id: 'ugc', label: 'UGC Style', icon: Heart, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 'post', label: 'General Post', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' }
];

const FUNNEL_STAGES: { id: FunnelStage; label: string; desc: string }[] = [
    { id: 'awareness', label: 'Awareness', desc: 'Reach new people' },
    { id: 'consideration', label: 'Consideration', desc: 'Build trust & interest' },
    { id: 'conversion', label: 'Conversion', desc: 'Drive sales' }
];

const ACTION_TYPES: { id: ActionType; label: string; icon: any }[] = [
    { id: 'dm', label: 'DM Me', icon: MessageSquare },
    { id: 'click', label: 'Link Click', icon: MousePointer2 },
    { id: 'comment', label: 'Comment', icon: MessageSquare },
    { id: 'purchase', label: 'Purchase', icon: ShoppingBag },
    { id: 'share', label: 'Share', icon: Share2 }
];

const CONTENT_FORMATS: { id: ContentFormat; label: string; icon: any; color: string; bg: string }[] = [
    { id: 'image', label: 'Image Post', icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'reel', label: 'Reel', icon: Video, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    { id: 'story', label: 'Story', icon: Layers, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { id: 'text', label: 'Text Post', icon: Type, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800/50' }
];

const PLATFORMS: { id: PlatformId; label: string; icon: any; color: string; bg: string; defaultFormat: ContentFormat }[] = [
    { id: 'Instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', defaultFormat: 'image' },
    { id: 'Facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', defaultFormat: 'image' },
    { id: 'TikTok', label: 'TikTok', icon: Music2, color: 'text-black dark:text-white', bg: 'bg-gray-100', defaultFormat: 'reel' },
    { id: 'YouTube', label: 'YouTube', icon: Youtube, color: 'text-red-600', bg: 'bg-red-50', defaultFormat: 'reel' }
];

// Platform icon lookup helper
const getPlatformIcon = (platformId: PlatformId) => {
    return PLATFORMS.find(p => p.id === platformId)?.icon || Globe;
};
const getPlatformColor = (platformId: PlatformId) => {
    const colors: Record<PlatformId, string> = {
        'Instagram': 'text-pink-500',
        'Facebook': 'text-blue-500',
        'TikTok': 'text-cyan-400',
        'YouTube': 'text-red-500'
    };
    return colors[platformId] || 'text-slate-400';
};

const QUICK_PRESETS: QuickPreset[] = [
    {
        id: 'viral_reel', label: 'Viral Reel', icon: Video, goal: 'post', format: 'reel',
        tag: { label: 'REACH', bgColor: 'bg-orange-500', textColor: 'text-white' },
        platforms: ['TikTok', 'Instagram', 'YouTube'], shimmer: true,
        defaults: { tone: 'Entertaining', ctaStyle: 'Engagement (Save/Share)', structure: 'Hook > Value > CTA', funnelStage: 'awareness', actionType: 'share' }
    },
    {
        id: 'product_demo', label: 'Product Demo', icon: ShoppingBag, goal: 'product_launch', format: 'reel',
        tag: { label: 'SALES', bgColor: 'bg-green-500', textColor: 'text-white' },
        platforms: ['Instagram', 'TikTok', 'Facebook'],
        defaults: { tone: 'Educational', ctaStyle: 'Shop Now', structure: 'Problem > Solution > Demo', funnelStage: 'consideration', actionType: 'click' }
    },
    {
        id: 'testimonial', label: 'Testimonial Video', icon: Heart, goal: 'ugc', format: 'reel',
        tag: { label: 'TRUST', bgColor: 'bg-pink-500', textColor: 'text-white' },
        platforms: ['Instagram', 'Facebook', 'YouTube'],
        defaults: { tone: 'Authentic', ctaStyle: 'Soft Sell', structure: 'User Story > Result', funnelStage: 'consideration', actionType: 'click' }
    },
    {
        id: 'flash_sale', label: 'Flash Sale', icon: Zap, goal: 'ad', format: 'story',
        tag: { label: 'ROI', bgColor: 'bg-purple-500', textColor: 'text-white' },
        platforms: ['Instagram', 'Facebook'],
        defaults: { tone: 'Urgent', ctaStyle: 'Swipe Up', structure: 'Offer > Timer > CTA', funnelStage: 'conversion', actionType: 'click' }
    },
    {
        id: 'teaser', label: 'Product Teaser', icon: Layers, goal: 'product_launch', format: 'story',
        tag: { label: 'HYPE', bgColor: 'bg-blue-500', textColor: 'text-white' },
        platforms: ['Instagram', 'TikTok', 'Facebook'],
        defaults: { tone: 'Mysterious', ctaStyle: 'Notify Me', structure: 'Glimpse > Date > CTA', funnelStage: 'awareness', actionType: 'comment' }
    },
    {
        id: 'showcase', label: 'Product Showcase', icon: ImageIcon, goal: 'product_launch', format: 'image',
        tag: { label: 'SALES', bgColor: 'bg-green-500', textColor: 'text-white' },
        platforms: ['Instagram', 'Facebook'],
        defaults: { tone: 'Premium', ctaStyle: 'Check Bio', structure: 'Hero Image > Benefits', funnelStage: 'conversion', actionType: 'click' }
    },
    {
        id: 'performance_ad', label: 'Performance Ad', icon: Zap, goal: 'ad', format: 'reel',
        tag: { label: 'ROI', bgColor: 'bg-purple-500', textColor: 'text-white' },
        platforms: ['Facebook', 'Instagram'],
        defaults: { tone: 'Persuasive', ctaStyle: 'Shop Now', structure: 'Hook > Benefit > Offer', funnelStage: 'conversion', actionType: 'purchase' }
    },
    {
        id: 'carousel_post', label: 'Carousel Post', icon: Layers, goal: 'post', format: 'image',
        tag: { label: 'VALUE', bgColor: 'bg-teal-500', textColor: 'text-white' },
        platforms: ['Instagram', 'TikTok', 'Facebook'],
        defaults: { tone: 'Informative', ctaStyle: 'Save for Later', structure: 'Intro > Points 1-3 > Summary', funnelStage: 'awareness', actionType: 'share' }
    },
    {
        id: 'user_story', label: 'User Story', icon: Heart, goal: 'ugc', format: 'story',
        tag: { label: 'TRUST', bgColor: 'bg-pink-500', textColor: 'text-white' },
        platforms: ['Instagram', 'TikTok'],
        defaults: { tone: 'Relatable', ctaStyle: 'Question/Poll', structure: 'Context > Experience > Question', funnelStage: 'consideration', actionType: 'comment' }
    }
];

// AI Tips Matrix - dynamic tips based on Goal Ã— Format
const AI_TIPS_MATRIX: Record<ContentGoal, Record<ContentFormat, AITip>> = {
    product_launch: {
        image: { headline: 'Clean product shots drive catalog conversions.', tips: ['Use high-resolution images', 'Show product from multiple angles', 'Include lifestyle context'] },
        reel: { headline: 'Demo videos get 3x more engagement.', tips: ['Hook in first 3 seconds', 'Show product in action', 'Add DZ Darja captions for local appeal'] },
        story: { headline: 'Stories build anticipation and urgency.', tips: ['Use countdown stickers', 'Add swipe-up links', 'Create a reveal sequence'] },
        text: { headline: 'Clear announcements drive awareness.', tips: ['Lead with the benefit', 'Include price and availability', 'Add a clear CTA'] }
    },
    ad: {
        image: { headline: 'Visual ads need stopping power.', tips: ['Keep text under 20% of image', 'Use contrasting colors', 'Test multiple headlines'] },
        reel: { headline: 'Short video ads auto-play in feed.', tips: ['Hook in first 1 second', 'Show the offer early', 'Use trending sounds/audio'] },
        story: { headline: 'Full-screen ads create FOMO.', tips: ['Add urgency with timers', 'Use native-looking content', 'Include swipe CTA'] },
        text: { headline: 'Text ads work best for retargeting.', tips: ['Personalize the message', 'Use social proof', 'Keep copy concise'] }
    },
    ugc: {
        image: { headline: 'Authentic photos feel like friend recommendations.', tips: ['Use natural lighting', 'Show real usage scenarios', 'Add personal captions'] },
        reel: { headline: 'High-energy vertical video designed for maximum reach and shares.', tips: ['Hook in first 3 seconds', 'Use trending sounds/audio', 'Add DZ Darja captions for local appeal'] },
        story: { headline: 'Day-in-the-life content resonates deeply.', tips: ['Keep it raw and unpolished', 'Use question stickers', 'Share behind-the-scenes'] },
        text: { headline: 'Text testimonials build credibility.', tips: ['Include specific details', 'Use emojis naturally', 'Share personal experience'] }
    },
    post: {
        image: { headline: 'Carousels get 3x more saves than single images.', tips: ['Tell a story across slides', 'Use consistent branding', 'End with a CTA slide'] },
        reel: { headline: 'Reels outperform all other formats.', tips: ['Hook in first 3 seconds', 'Use trending sounds/audio', 'Add DZ Darja captions for local appeal'] },
        story: { headline: 'Interactive stickers boost retention.', tips: ['Use polls and quizzes', 'Add music for mood', 'Create episodic content'] },
        text: { headline: 'Text posts get high organic engagement.', tips: ['Start with a hook', 'Use line breaks for readability', 'Ask a question at the end'] }
    }
};

const DEFAULT_CONTEXT_BLOCKS: ContextBlockSpec[] = [
    {
        id: 'audience',
        title: 'Target Audience',
        priority: 'required',
        helperText: 'Who is this for? Be specific (age, interests, situation, locale).',
        whyThisMatters: 'Audience changes hooks, language, benefits, and objections.',
        fields: [
            {
                id: 'targetAudience',
                label: 'Audience Persona',
                kind: 'textarea',
                placeholder: 'e.g., Busy moms in Algeria who want quick meal prep…',
                suggestions: ['Busy moms', 'Students', 'Gym beginners', 'Office workers', 'Gift buyers'],
            },
            {
                id: 'painPoints',
                label: 'Pain Points',
                kind: 'chips',
                multiple: true,
                placeholder: 'Add a pain point…',
                suggestions: ['No time', 'Too expensive', 'Confusing options', 'Low quality'],
            },
            {
                id: 'objections',
                label: 'Common objections (optional)',
                kind: 'chips',
                multiple: true,
                placeholder: 'Add an objection…',
                suggestions: ['Too expensive', 'Does it work?', 'Delivery time', 'Quality concerns'],
            },
        ],
    },
    {
        id: 'offer',
        title: 'Offer & Constraints',
        priority: 'required',
        helperText: 'What are you selling and what are the rules?',
        whyThisMatters: 'The offer anchors the promise and prevents unusable drafts.',
        fields: [
            {
                id: 'offer',
                label: 'Offer / Promise',
                kind: 'textarea',
                placeholder: 'e.g., Save 20% today + free delivery…',
                suggestions: ['20% off', 'Buy 1 get 1', 'Free delivery', 'Limited stock', 'Cash on delivery'],
            },
            {
                id: 'price',
                label: 'Price (optional)',
                kind: 'text',
                placeholder: 'e.g., 3990 DZD',
            },
            {
                id: 'shipping',
                label: 'Shipping (optional)',
                kind: 'text',
                placeholder: 'e.g., 24–48h nationwide',
            },
            {
                id: 'constraints',
                label: 'Constraints / Do not say (optional)',
                kind: 'textarea',
                placeholder: 'e.g., Avoid medical claims; no “guaranteed”…',
            },
        ],
    },
    {
        id: 'usp',
        title: 'Unique Selling Points',
        priority: 'recommended',
        helperText: 'What makes it different/better? Add multiple points.',
        whyThisMatters: 'USPs prevent generic copy and create differentiation.',
        fields: [
            {
                id: 'usp',
                label: 'USPs',
                kind: 'chips',
                multiple: true,
                placeholder: 'Add a USP…',
                suggestions: ['Made in Algeria', '2-year warranty', 'Eco-friendly', 'Premium materials'],
            },
        ],
    },
    {
        id: 'proof',
        title: 'Proof',
        priority: 'recommended',
        helperText: 'Add testimonials, metrics, results, or social proof.',
        whyThisMatters: 'Proof reduces hesitation and increases conversion.',
        fields: [
            {
                id: 'proof',
                label: 'Proof / Metrics',
                kind: 'textarea',
                placeholder: 'e.g., 4.8⭐ from 1,200 customers; before/after…',
            },
            {
                id: 'testimonials',
                label: 'Testimonials (optional)',
                kind: 'chips',
                multiple: true,
                placeholder: 'Add a testimonial snippet…',
            },
        ],
    },
    {
        id: 'voice',
        title: 'Brand Voice & Style',
        priority: 'recommended',
        helperText: 'Define the personality and style of the content.',
        whyThisMatters: 'Keeps outputs consistent across content types.',
        fields: [
            {
                id: 'voiceSliders',
                label: 'Voice Profile',
                kind: 'slider-group',
                sliders: [
                    { id: 'formalCasual', left: 'Formal', right: 'Casual' },
                    { id: 'boldSoft', left: 'Bold', right: 'Soft' },
                    { id: 'funnySerious', left: 'Funny', right: 'Serious' },
                ]
            },
            {
                id: 'wordsToUse',
                label: 'Words to use',
                kind: 'chips',
                multiple: true,
                placeholder: 'e.g., Premium, Exclusive...',
                suggestions: ['Premium', 'Fast', 'Easy', 'Guaranteed', 'Authentic'],
            },
            {
                id: 'wordsToAvoid',
                label: 'Words to avoid',
                kind: 'chips',
                multiple: true,
                placeholder: 'e.g., Cheap, Maybe...',
                suggestions: ['Cheap', 'Maybe', 'Hassle', 'Expensive'],
            },
            {
                id: 'exampleCaption',
                label: 'Example Caption',
                kind: 'textarea',
                placeholder: 'Paste a caption you like to mimic its style...',
            },
        ],
    },
    {
        id: 'cta',
        title: 'Call to Action',
        priority: 'required',
        helperText: 'What should the viewer do next?',
        whyThisMatters: 'Clear next steps improve response and conversions.',
        fields: [
            {
                id: 'cta',
                label: 'CTA',
                kind: 'text',
                placeholder: 'e.g., DM “ORDER” to buy',
                suggestions: ['DM “ORDER”', 'Shop now', 'Comment “LINK”', 'Save this post'],
            },
        ],
    },
];

const COMBO_CONTEXT_MATRIX: Record<ContentGoal, Record<ContentFormat, ComboContextSpec>> = {
    product_launch: {
        image: {
            requiredContext: ['product', 'offer', 'cta', 'targetAudience'],
            niceToHave: ['usp', 'proof', 'brandVoice', 'price', 'shipping'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        reel: {
            requiredContext: ['product', 'offer', 'cta', 'targetAudience'],
            niceToHave: ['usp', 'proof', 'brandVoice', 'price', 'shipping', 'objections'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        story: {
            requiredContext: ['product', 'offer', 'cta'],
            niceToHave: ['targetAudience', 'proof', 'brandVoice', 'price', 'shipping'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        text: {
            requiredContext: ['product', 'offer', 'cta'],
            niceToHave: ['targetAudience', 'proof', 'brandVoice', 'price', 'shipping'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
    },
    ad: {
        image: {
            requiredContext: ['product', 'offer', 'cta'],
            niceToHave: ['targetAudience', 'proof', 'usp', 'brandVoice'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        reel: {
            requiredContext: ['product', 'offer', 'cta'],
            niceToHave: ['targetAudience', 'proof', 'usp', 'brandVoice', 'objections'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        story: {
            requiredContext: ['product', 'offer', 'cta'],
            niceToHave: ['targetAudience', 'proof', 'usp', 'brandVoice'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        text: {
            requiredContext: ['product', 'cta'],
            niceToHave: ['offer', 'targetAudience', 'proof', 'brandVoice'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
    },
    ugc: {
        image: {
            requiredContext: ['product', 'targetAudience', 'cta'],
            niceToHave: ['proof', 'brandVoice', 'offer', 'usp'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        reel: {
            requiredContext: ['product', 'targetAudience', 'cta'],
            niceToHave: ['proof', 'brandVoice', 'offer', 'usp'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        story: {
            requiredContext: ['product', 'targetAudience', 'cta'],
            niceToHave: ['proof', 'brandVoice', 'offer', 'usp'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        text: {
            requiredContext: ['product', 'targetAudience', 'cta'],
            niceToHave: ['proof', 'brandVoice', 'offer'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
    },
    post: {
        image: {
            requiredContext: ['product', 'cta'],
            niceToHave: ['targetAudience', 'offer', 'proof', 'brandVoice', 'usp'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        reel: {
            requiredContext: ['product', 'cta'],
            niceToHave: ['targetAudience', 'offer', 'proof', 'brandVoice', 'usp'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        story: {
            requiredContext: ['cta'],
            niceToHave: ['product', 'targetAudience', 'offer', 'proof', 'brandVoice'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
        text: {
            requiredContext: ['cta'],
            niceToHave: ['product', 'targetAudience', 'offer', 'proof', 'brandVoice'],
            contextBlocks: DEFAULT_CONTEXT_BLOCKS,
        },
    },
};

// 16-Row Creation Matrix - Full Specification
const CREATION_MATRIX: Record<string, Record<string, any>> = {
    product_launch: {
        image: {
            title: 'Product Name', caption: 'Key Benefits', tone: 'Professional',
            extra: ['Price', 'Link', 'Specs'],
            enhanceTools: ['BG Remove', 'Price Tag', 'Specs Overlay'],
            preview: 'Product Card', editTools: 'Photo Tools',
            why: 'Clean product shots drive catalog conversions.',
            examples: {
                hooks: ["Meet the new standard in [Industry]", "Finally, a [Product] that actually works", "The wait is over."],
                ctas: ["Shop the drop at link in bio", "Limited stock available - secure yours now", "Tap to view product details"],
                mistakes: ["Cluttered image with too much text", "Low resolution product photo", "Forgetting the price or link"]
            }
        },
        reel: {
            title: 'Hook / Opening', caption: 'Demo Script', tone: 'Exciting',
            extra: ['Duration', 'Features'],
            enhanceTools: ['Demo Script', 'Feature Overlay'],
            preview: 'Video Player', editTools: 'Video Tools',
            why: 'Demo videos get 3x more engagement.',
            examples: {
                hooks: ["Stop scrolling if you struggle with [Problem]", "Here's why [Product] is going viral", "Unboxing the [Product]"],
                ctas: ["Grab yours before it sells out", "Link in bio to shop", "Comment 'NEED' for the link"],
                mistakes: ["Boring intro (no hook)", "Music too loud over voiceover", "Video too long (>60s)"]
            }
        },
        story: {
            title: 'Teaser Text', caption: 'Swipe CTA', tone: 'Urgent',
            extra: ['Countdown', 'Link'],
            enhanceTools: ['Countdown', 'Reveal Anim'],
            preview: 'Vertical Full', editTools: 'Story Tools',
            why: 'Stories build anticipation and urgency.',
            examples: {
                hooks: ["Something big is coming...", "Can you guess what this is?", "Only 24 hours left!"],
                ctas: ["Swipe up to get early access", "Tap the sticker to notify me", "Check the link before it's gone"],
                mistakes: ["Too much text (hard to read quickly)", "No interactive elements", "Not vertical format"]
            }
        },
        text: {
            title: 'Announcement', caption: 'Product Details', tone: 'Informative',
            extra: ['Price', 'Link'],
            enhanceTools: ['Feature List', 'Specs Gen'],
            preview: 'Text Card', editTools: 'Text Tools',
            why: 'Text posts work for announcements.',
            examples: {
                hooks: ["Big news: [Product] is finally here!", "We've been keeping a secret...", "The upgrade you've been waiting for"],
                ctas: ["Order now at [Link]", "Learn more in the comments", "Tag a friend who needs this"],
                mistakes: ["Wall of text (no paragraphs)", "Buried the lead (hook at the end)", "No clear call to action"]
            }
        }
    },
    ad: {
        image: {
            title: 'Headline', caption: 'Primary Text', tone: 'Persuasive',
            extra: ['CTA Button', 'Offer'],
            enhanceTools: ['Text Check', 'A/B Headline'],
            preview: 'Ad Preview', editTools: 'Photo Tools',
            why: 'Text rule affects ad delivery.',
            examples: {
                hooks: ["Stop [Problem] in its tracks", "The #1 solution for [Audience]", "Don't buy [Competitor] until you see this"],
                ctas: ["Shop Now - 50% Off", "Get Offer", "Learn More"],
                mistakes: ["Text covers >20% of image", "Generic stock photo", "Mismatch between image and copy"]
            }
        },
        reel: {
            title: 'Hook Line', caption: 'Ad Script', tone: 'Urgent',
            extra: ['Duration', 'CTA Button'],
            enhanceTools: ['Hook Opt', 'CTA Overlay'],
            preview: 'Video Ad', editTools: 'Video Tools',
            why: 'Short videos auto-play in feed.',
            examples: {
                hooks: ["3 reasons you need [Product]", "I wish I knew this sooner...", "Watch this before you buy"],
                ctas: ["Click below to save", "Install Now", "Get your free trial"],
                mistakes: ["Slow start (loses attention)", "Not designed for sound-off", "CTA only at the very end"]
            }
        },
        story: {
            title: 'Headline', caption: 'Overlay Text', tone: 'Urgent',
            extra: ['Link', 'Offer'],
            enhanceTools: ['Flash Timer', 'Link Overlay'],
            preview: 'Story Ad', editTools: 'Story Tools',
            why: 'FOMO drives immediate action.',
            examples: {
                hooks: ["Last chance for [Offer]", "Flash Sale Alert ⚡", "You won't believe this price"],
                ctas: ["Swipe Up to Shop", "Get it now", "Claim Offer"],
                mistakes: ["Elements covered by UI overlay", "Not native looking", "Confusing message"]
            }
        },
        text: {
            title: 'Headline', caption: 'Ad Copy', tone: 'Professional',
            extra: ['CTA Button'],
            enhanceTools: ['Headline Gen', 'CTA Builder'],
            preview: 'Text Ad', editTools: 'Text Tools',
            why: 'Text ads work best for retargeting.',
            examples: {
                hooks: ["Still thinking about [Product]?", "Did you forget something?", "[Audience], this is for you"],
                ctas: ["Complete your order", "Sign up today", "Get a quote"],
                mistakes: ["Too aggressive salesy tone", "Ignoring the funnel stage", "Grammar errors"]
            }
        }
    },
    ugc: {
        image: {
            title: 'Caption Hook', caption: 'Story', tone: 'Authentic',
            extra: ['Emojis'],
            enhanceTools: ['Candid Filter', 'Story Overlay'],
            preview: 'Social Post', editTools: 'Photo Tools',
            why: 'Authentic photos feel like friend recommendations.',
            examples: {
                hooks: ["My honest review of [Product]", "Obsessed with this!", "Life hack: [Product]"],
                ctas: ["Link in my bio!", "Ask me anything in comments", "Save this for later"],
                mistakes: ["Looks too staged/polished", "Sounding like a script", "Bad lighting"]
            }
        },
        reel: {
            title: 'Opening Line', caption: 'Talking Points', tone: 'Relatable',
            extra: ['Emojis', 'Expression'],
            enhanceTools: ['Auth Check', 'Green Screen'],
            preview: 'UGC Player', editTools: 'Video Tools',
            why: 'Authentic content bypasses ad filters.',
            examples: {
                hooks: ["Come get ready with me", "Day in the life using [Product]", "I tried [Trend] so you don't have to"],
                ctas: ["Check it out here", "Follow for more tips", "Share with a friend"],
                mistakes: ["Fake excitement", "Clearly reading a script", "Not showing the face"]
            }
        },
        story: {
            title: 'POV', caption: 'Caption', tone: 'Personal',
            extra: ['Emojis', 'Sticker'],
            enhanceTools: ['POV Tips', 'Question Sticker'],
            preview: 'Story View', editTools: 'Story Tools',
            why: 'Day-in-the-life content resonates deeply.',
            examples: {
                hooks: ["You guys kept asking about...", "Quick update on...", "Look what just arrived!"],
                ctas: ["Tap for details", "React with 🔥 if you love it", "DM me for link"],
                mistakes: ["Too many cuts", "Unclear audio", "Ignoring community questions"]
            }
        },
        text: {
            title: 'Opening', caption: 'Review Body', tone: 'Honest',
            extra: ['Emojis'],
            enhanceTools: ['Review Template', 'Emoji Add'],
            preview: 'Review Card', editTools: 'Text Tools',
            why: 'Text testimonials build credibility.',
            examples: {
                hooks: ["Why I switched to [Product]", "5 stars isn't enough", "Real talk: is it worth it?"],
                ctas: ["Read full review", "Try it yourself", "Let me know your thoughts"],
                mistakes: ["Sounding like a bot", "Only positive (no balance)", "Vague praise"]
            }
        }
    },
    post: {
        image: {
            title: 'Post Title', caption: 'Caption', tone: 'Friendly',
            extra: ['Hashtags'],
            enhanceTools: ['Carousel Bldr', 'Hashtags'],
            preview: 'Insta Post', editTools: 'Photo Tools',
            why: 'Carousels get 3x more saves than single images.',
            examples: {
                hooks: ["5 tips for [Topic]", "How to [Benefit] in 3 steps", "The truth about [Topic]"],
                ctas: ["Save this post", "Share with your team", "Double tap if you agree"],
                mistakes: ["Too much info on one slide", "Small font size", "Inconsistent colors"]
            }
        },
        reel: {
            title: 'Hook', caption: 'Video Outline', tone: 'Entertaining',
            extra: ['Duration', 'Sound'],
            enhanceTools: ['Viral Sound', 'Hook Check'],
            preview: 'Reel Player', editTools: 'Video Tools',
            why: 'Reels outperform all other formats.',
            examples: {
                hooks: ["Did you know this?", "Watch till the end", "This changed my life"],
                ctas: ["Follow for daily tips", "Check the pinned comment", "Send this to a friend"],
                mistakes: ["Low energy", "Bad lighting", "Ignoring comments"]
            }
        },
        story: {
            title: 'Slide Title', caption: 'Overlay Text', tone: 'Casual',
            extra: ['Poll', 'Quiz'],
            enhanceTools: ['Poll Sticker', 'Quiz Sticker'],
            preview: 'Story View', editTools: 'Story Tools',
            why: 'Interactive stickers boost retention.',
            examples: {
                hooks: ["Help me choose!", "Question of the day:", "Good morning ☀️"],
                ctas: ["Vote now", "Drop a question", "Send me a DM"],
                mistakes: ["Overusing stickers", "Hard to read text", "Posting too many at once"]
            }
        },
        text: {
            title: 'Post Title', caption: 'Body Content', tone: 'Professional',
            extra: [],
            enhanceTools: ['Headline Gen', 'Readability'],
            preview: 'LinkedIn Post', editTools: 'Text Tools',
            why: 'Text posts get high organic engagement.',
            examples: {
                hooks: ["Unpopular opinion:", "Here's what I learned about [Topic]", "The future of [Industry]"],
                ctas: ["Discuss in comments", "Connect with me", "Read the article"],
                mistakes: ["Clickbait title", "No paragraph breaks", "Rambling without point"]
            }
        }
    }
};

// 64-Row Platforms Matrix - Complete Specification
const PLATFORM_MATRIX: Record<string, Record<string, Record<string, any>>> = {
    // ========== PRODUCT LAUNCH ==========
    product_launch: {
        image: {
            Instagram: { ctx: 'High-res images with tags drive discovery.', type: 'Insta Post (Square/Portrait)', tools: ['Product Tag', 'Shop Link', 'Filters'] },
            Facebook: { ctx: 'Multiple images in album view perform best.', type: 'FB Post (Album/Single)', tools: ['Messenger Button', 'Shop Link', 'Alt Text'] },
            TikTok: { ctx: 'Carousel mode (Photo Mode) is trending.', type: 'TikTok Carousel', tools: ['Trending Sound', 'Location', 'Stickers'] },
            YouTube: { ctx: 'Community posts engage subscribers.', type: 'YT Community Post', tools: ['Poll', 'Related Video Link'] }
        },
        reel: {
            Instagram: {
                ctx: 'Reels account for 20% of time on app.',
                type: 'Insta Reel (9:16)',
                tools: ['Trending Audio', 'Topics', 'Collab'],
                constraints: {
                    length: "Up to 90s (Rec: 7-15s)",
                    safeZone: "Avoid bottom 30% (captions)",
                    audio: "Trending audio is critical",
                    quality: "1080x1920 (No watermarks)"
                }
            },
            Facebook: { ctx: 'Reels on FB reach older demographics.', type: 'FB Reel (9:16)', tools: ['Remix Settings', 'Captions'] },
            TikTok: {
                ctx: 'Native content converts 72% better.',
                type: 'TikTok Video (9:16)',
                tools: ['TikTok Sound', 'Duet/Stitch', 'Text Duration'],
                constraints: {
                    length: "15s – 60s (Sweet spot: 21-34s)",
                    safeZone: "Clear bottom 20% & right 15%",
                    textLimit: "Keep captions short",
                    pacing: "Fast (change angle every 3s)"
                }
            },
            YouTube: { ctx: 'Shorts drive massive sub growth.', type: 'YT Short (9:16)', tools: ['Related Video', 'Audio Remix'] }
        },
        story: {
            Instagram: { ctx: '500M daily users view stories.', type: 'Insta Story (9:16)', tools: ['Link Sticker', 'Countdown', 'Product Sticker'] },
            Facebook: { ctx: 'Stories persist for 24h, high visibility.', type: 'FB Story (9:16)', tools: ['Link', 'Music', 'Poll'] },
            TikTok: { ctx: 'Stories appear in FYP now.', type: 'TikTok Story (9:16)', tools: ['Interactive Stickers', 'Sound'] },
            YouTube: { ctx: 'Shorts can frame as updates.', type: 'YT Short (Concept)', tools: ['Subscribe Overlay'] }
        },
        text: {
            Instagram: { ctx: 'Create Mode or Quote posts for clarity.', type: 'Insta Text (Square)', tools: ['Background Options', 'Typewriter'] },
            Facebook: { ctx: 'Detailed posts build community.', type: 'FB Text Post', tools: ['Bg Color', 'Feelings/Activity'] },
            TikTok: { ctx: 'Text Mode allows 1000 chars overlay.', type: 'TikTok Text Mode', tools: ['Background Sound', 'Reading Speed'] },
            YouTube: { ctx: 'Text-only Community posts.', type: 'YT Community Text', tools: ['Poll', 'Image Poll'] }
        }
    },
    // ========== AD CREATIVE ==========
    ad: {
        image: {
            Instagram: { ctx: 'Visual-first ads need strong stopping power.', type: 'Insta Feed Ad', tools: ['CTA Button', 'Carousel Cards'] },
            Facebook: { ctx: 'Primary Text is key for conversion.', type: 'FB Feed Ad', tools: ['Headline A/B', 'Description'] },
            TikTok: { ctx: 'Pangle/Newsfeed placement.', type: 'Image Ad Card', tools: ['Smart Text', 'CTA'] },
            YouTube: { ctx: 'Display ads on homepage/sidebar.', type: 'Display Ad', tools: ['Headline', 'Logo Overlay'] }
        },
        reel: {
            Instagram: { ctx: 'Reels Ads blend with organic content.', type: 'Insta Reels Ad', tools: ['Sponsored Tag', 'Shop Overlay'] },
            Facebook: { ctx: 'Video feeds are high intent.', type: 'FB Video Ad', tools: ['Video Description', 'Call Button'] },
            TikTok: { ctx: 'Spark Ads (organic boost) perform best.', type: 'TikTok Spark Ad', tools: ['Auth Code', 'Anchor Link'] },
            YouTube: { ctx: 'Shorts Ads are skippable but high reach.', type: 'Shorts Ad', tools: ['Action Button', 'Product Feed'] }
        },
        story: {
            Instagram: { ctx: 'Immersive full-screen experience.', type: 'Insta Story Ad', tools: ['Swipe Mark', 'Poll Ad'] },
            Facebook: { ctx: 'Interruptive but high visual impact.', type: 'FB Story Ad', tools: ['Messenger Destination'] },
            TikTok: { ctx: '(Similar to Reels placement).', type: 'TikTok Story Ad', tools: ['Interactive Add-on'] },
            YouTube: { ctx: '(N/A usually Shorts Ad).', type: 'Shorts Ad', tools: ['CTA Overlay'] }
        },
        text: {
            Instagram: { ctx: '(N/A - visual only).', type: 'N/A', tools: ['Convert to Image'] },
            Facebook: { ctx: 'Sponsored Posts look native.', type: 'Sponsored Post', tools: ['Long Copy', 'Comment Moderation'] },
            TikTok: { ctx: '(N/A).', type: 'N/A', tools: ['Convert to Video'] },
            YouTube: { ctx: '(N/A).', type: 'N/A', tools: ['Convert to Video'] }
        }
    },
    // ========== UGC STYLE ==========
    ugc: {
        image: {
            Instagram: { ctx: 'Photo dumps feel authentic.', type: 'Insta Carousel', tools: ['Location', 'User Tag'] },
            Facebook: { ctx: 'Personal photos get more likes/comments.', type: 'FB Photo Post', tools: ['Tag Friends', 'Check-in'] },
            TikTok: { ctx: 'Photo Mode for storytelling.', type: 'TikTok Photo Mode', tools: ['Swipe Tip', 'Trending Song'] },
            YouTube: { ctx: '(Community Post).', type: 'Community Post', tools: ['Subscriber-only'] }
        },
        reel: {
            Instagram: { ctx: 'Lo-fi phone video performs best.', type: 'Insta Reel', tools: ['Green Screen', 'Trending Audio'] },
            Facebook: { ctx: '(Cross-posted Reels).', type: 'FB Reel', tools: ['Remix'] },
            TikTok: { ctx: 'The home of UGC trends.', type: 'TikTok Video', tools: ['Voice Effect', 'Filter', 'CapCut Template'] },
            YouTube: { ctx: 'Shorts allow remixing long-form.', type: 'YT Short', tools: ['Green Screen', 'Remix Source'] }
        },
        story: {
            Instagram: { ctx: 'Raw, unpolished behind-the-scenes.', type: 'Insta Story', tools: ['Question Box', 'Add Yours'] },
            Facebook: { ctx: 'Cross-posting from Insta common.', type: 'FB Story', tools: ['Reactions'] },
            TikTok: { ctx: 'Quick updates.', type: 'TikTok Story', tools: ['Text Overlay'] },
            YouTube: { ctx: '(Shorts).', type: 'YT Short', tools: ['Sound'] }
        },
        text: {
            Instagram: { ctx: 'Notes or Twitter screenshots.', type: 'Insta Note/Image', tools: ['Note Bubble'] },
            Facebook: { ctx: 'Long-form personal stories.', type: 'FB Status', tools: ['Background'] },
            TikTok: { ctx: 'Text Mode storytime.', type: 'TikTok Text', tools: ['TTS Voice'] },
            YouTube: { ctx: 'Community updates.', type: 'Community Text', tools: ['Poll'] }
        }
    },
    // ========== GENERAL POST ==========
    post: {
        image: {
            Instagram: { ctx: 'Aesthetic feed layout.', type: 'Insta Post', tools: ['Filter', 'Adjustments'] },
            Facebook: { ctx: 'Shareable content.', type: 'FB Post', tools: ['Share Settings'] },
            TikTok: { ctx: '(Photo Mode).', type: 'TikTok Photo', tools: ['Sound'] },
            YouTube: { ctx: 'Community visibility.', type: 'Community Post', tools: ['Schedule'] }
        },
        reel: {
            Instagram: { ctx: 'Algorithm favors Reels.', type: 'Insta Reel', tools: ['Recommend on FB'] },
            Facebook: { ctx: 'Watch feed discovery.', type: 'FB Reel', tools: ['Captions'] },
            TikTok: { ctx: 'Main feed visibility.', type: 'TikTok Video', tools: ['Playlist', 'Tags'] },
            YouTube: { ctx: 'Shorts shelf visibility.', type: 'YT Short', tools: ['Visibility'] }
        },
        story: {
            Instagram: { ctx: 'Engagement retention.', type: 'Insta Story', tools: ['Mention', 'Music'] },
            Facebook: { ctx: 'Friends connection.', type: 'FB Story', tools: ['Privacy'] },
            TikTok: { ctx: 'Follower update.', type: 'TikTok Story', tools: ['Drafts'] },
            YouTube: { ctx: '(Shorts).', type: 'YT Short', tools: ['Select Audience'] }
        },
        text: {
            Instagram: { ctx: 'Quote cards.', type: 'Quote Image', tools: ['Font Style'] },
            Facebook: { ctx: 'Status update.', type: 'FB Status', tools: ['Lists'] },
            TikTok: { ctx: 'Text overlay video.', type: 'TikTok Text', tools: ['Duration'] },
            YouTube: { ctx: 'Text update.', type: 'Community', tools: ['Links'] }
        }
    }
};

interface MultiContentGeneratorProps {
    onHistory?: () => void;
    onImport?: () => void;
    onExport?: () => void;
}

export default function MultiContentGenerator({ onHistory, onImport, onExport }: MultiContentGeneratorProps = {}) {
    const [currentStep, setCurrentStep] = useState(1);

    // State
    const [product, setProduct] = useState<ProductConfig>({ name: '', description: '', url: '', cloneUrl: '' });
    const [selectedGoal, setSelectedGoal] = useState<ContentGoal>('product_launch');
    const [selectedFormat, setSelectedFormat] = useState<ContentFormat>('image');

    const [creationMode, setCreationMode] = useState<CreationMode>('manual'); // Switcher 1
    const [viewMode, setViewMode] = useState<CreationMode>('manual'); // Switcher 2 (Independent)

    const [contentInput, setContentInput] = useState({ title: '', caption: '', tone: '' });

    // --- Context Brief (UI-only) ---
    const [brief, setBrief] = useState({
        audience: '',
        offer: '',
        price: '',
        shipping: '',
        proof: '' as string,
        cta: '',
        brandVoice: '', // Kept for legacy/fallback

        // Brand Voice Extended
        voiceSliders: {
            formalCasual: 50,
            boldSoft: 50,
            funnySerious: 50,
        } as Record<string, number>,
        wordsToUse: [] as string[],
        wordsToAvoid: [] as string[],
        exampleCaption: '',

        // Multi-value context
        objections: [] as string[],
        usps: [] as string[],
        testimonials: [] as string[],
        painPoints: [] as string[], // New
    });

    const [funnelStage, setFunnelStage] = useState<FunnelStage>('awareness');
    const [actionType, setActionType] = useState<ActionType>('click');

    const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(['Instagram', 'Facebook']);
    const [primaryPlatform, setPrimaryPlatform] = useState<PlatformId>('Instagram');
    const [hoveredPlatform, setHoveredPlatform] = useState<PlatformId | null>(null);

    const [chipDrafts, setChipDrafts] = useState<Partial<Record<ContextFieldId, string>>>({});
    const [selectedPreset, setSelectedPreset] = useState<QuickPreset | null>(null); // New state for dialog

    const sectionRefs = {
        product: useRef<HTMLDivElement | null>(null),
        audience: useRef<HTMLDivElement | null>(null),
        offer: useRef<HTMLDivElement | null>(null),
        proof: useRef<HTMLDivElement | null>(null),
        cta: useRef<HTMLDivElement | null>(null),
        voice: useRef<HTMLDivElement | null>(null),
    };

    const comboKey = `${selectedGoal}:${selectedFormat}`;
    const currentMatrix = CREATION_MATRIX[selectedGoal][selectedFormat];

    const comboContextSpec = useMemo(() => {
        return COMBO_CONTEXT_MATRIX[selectedGoal]?.[selectedFormat];
    }, [selectedGoal, selectedFormat]);

    const contextValues = useMemo(() => {
        // Summarize voice sliders into a readable string
        const voiceSummary = Object.entries(brief.voiceSliders)
            .map(([k, v]) => {
                const label = k === 'formalCasual' ? (v < 40 ? 'Formal' : v > 60 ? 'Casual' : 'Neutral') :
                    k === 'boldSoft' ? (v < 40 ? 'Bold' : v > 60 ? 'Soft' : 'Balanced') :
                        k === 'funnySerious' ? (v < 40 ? 'Funny' : v > 60 ? 'Serious' : 'Standard') : '';
                return label;
            })
            .filter(Boolean)
            .join(', ');

        return {
            product: product.name,
            targetAudience: brief.audience,
            offer: brief.offer,
            price: brief.price,
            shipping: brief.shipping,
            proof: brief.proof,
            cta: brief.cta,
            brandVoice: brief.brandVoice || voiceSummary, // Use detailed if available
            objections: (brief.objections || []).join(' • '),
            usp: (brief.usps || []).join(' • '),
            constraints: '',
            testimonials: (brief.testimonials || []).join(' • '),
            painPoints: (brief.painPoints || []).join(' • '),
            wordsToUse: (brief.wordsToUse || []).join(', '),
            wordsToAvoid: (brief.wordsToAvoid || []).join(', '),
            exampleCaption: brief.exampleCaption,
            voiceSliders: voiceSummary,
        } as Record<ContextFieldId, string>;
    }, [brief, product.name]);

    const completeness = useMemo(() => {
        const requiredIds = comboContextSpec?.requiredContext ?? ['product', 'cta'];
        const niceIds = comboContextSpec?.niceToHave ?? ['targetAudience', 'offer', 'proof', 'brandVoice'];

        const isFilled = (id: ContextFieldId) => {
            // Special check for sliders/chips if they are required (usually optional)
            if (id === 'voiceSliders') return true; // Always has value
            return Boolean((contextValues[id] ?? '').trim());
        };

        const requiredTotal = requiredIds.length;
        const requiredDone = requiredIds.filter(isFilled).length;
        const niceTotal = niceIds.length;
        const niceDone = niceIds.filter(isFilled).length;

        // Weight required 80%, nice-to-have 20%
        const requiredScore = requiredTotal === 0 ? 1 : requiredDone / requiredTotal;
        const niceScore = niceTotal === 0 ? 1 : niceDone / niceTotal;
        const score = Math.round((requiredScore * 0.8 + niceScore * 0.2) * 100);

        const labelFor: Record<ContextFieldId, string> = {
            product: 'Product',
            targetAudience: 'Audience',
            offer: 'Offer',
            constraints: 'Constraints',
            usp: 'USPs',
            proof: 'Proof',
            cta: 'CTA',
            brandVoice: 'Brand Voice',
            objections: 'Objections',
            price: 'Price',
            shipping: 'Shipping',
            testimonials: 'Testimonials',
            painPoints: 'Pain Points',
            voiceSliders: 'Voice Profile',
            wordsToUse: 'Keywords',
            wordsToAvoid: 'Negative Keywords',
            exampleCaption: 'Example'
        };

        const whyFor: Partial<Record<ContextFieldId, string>> = {
            product: 'So the draft can be specific.',
            targetAudience: 'Hooks and wording change drastically by audience.',
            offer: 'A clear promise improves conversion.',
            proof: 'Social proof reduces hesitation.',
            cta: 'A clear next action increases conversion.',
            brandVoice: 'Keeps outputs consistent with your brand.',
        };

        const missingIds = [...requiredIds, ...niceIds].filter((id) => !isFilled(id)).slice(0, 5);
        const missing = missingIds.map((id) => ({
            id,
            label: labelFor[id] ?? id,
            why: whyFor[id] ?? 'Improves output quality.',
        }));

        return { score, missing, requiredIds, niceIds };
    }, [comboContextSpec, contextValues]);

    const normalizedBrief = useMemo(() => {
        return {
            product: product.name,
            audience: brief.audience,
            promise: brief.offer,
            offer: brief.offer,
            proof: brief.proof,
            tone: brief.brandVoice || currentMatrix?.tone,
            cta: brief.cta,
            // Include new fields for debugging/usage
            painPoints: brief.painPoints,
            voice: brief.voiceSliders,
        };
    }, [brief, currentMatrix?.tone, product.name]);

    const scrollToContext = (id: string) => {
        const map: Record<string, React.RefObject<HTMLDivElement | null> | undefined> = {
            // product
            product: sectionRefs.product,

            // audience
            targetAudience: sectionRefs.audience,
            objections: sectionRefs.audience,
            painPoints: sectionRefs.audience,

            // offer
            offer: sectionRefs.offer,
            price: sectionRefs.offer,
            shipping: sectionRefs.offer,
            constraints: sectionRefs.offer,
            usp: sectionRefs.offer,

            // proof
            proof: sectionRefs.proof,
            testimonials: sectionRefs.proof,

            // voice
            brandVoice: sectionRefs.voice,
            voiceSliders: sectionRefs.voice,
            wordsToUse: sectionRefs.voice,
            wordsToAvoid: sectionRefs.voice,
            exampleCaption: sectionRefs.voice,

            // cta
            cta: sectionRefs.cta,
        };
        map[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleCompleteContext = () => {
        const firstMissing = completeness.missing[0]?.id as ContextFieldId | undefined;
        if (firstMissing) scrollToContext(firstMissing);
    };

    // Handlers
    const handlePresetSelect = (preset: QuickPreset) => {
        setSelectedPreset(preset); // Open confirmation dialog
    };

    const handlePresetConfirm = () => {
        if (!selectedPreset) return;

        setSelectedGoal(selectedPreset.goal);
        setSelectedFormat(selectedPreset.format);
        setSelectedPlatforms(selectedPreset.platforms);

        // Auto-fill defaults if fields are empty
        setBrief(prev => ({
            ...prev,
            brandVoice: prev.brandVoice || selectedPreset.defaults.tone,
            cta: prev.cta || selectedPreset.defaults.ctaStyle,
        }));

        if (selectedPreset.defaults.funnelStage) setFunnelStage(selectedPreset.defaults.funnelStage);
        if (selectedPreset.defaults.actionType) setActionType(selectedPreset.defaults.actionType);

        // You could also set structure as a "hint" or "template" if you had a field for it

        setSelectedPreset(null);
    };

    const STEPS = [
        { id: 1, label: "Strategy", description: "Product & Audience" },
        { id: 2, label: "Structure", description: "Goal & Format" },
        { id: 3, label: "Creative", description: "Draft & Polish" }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 p-4 pb-24">

            {/* Preset Confirmation Dialog */}
            <Dialog open={!!selectedPreset} onOpenChange={(open) => !open && setSelectedPreset(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedPreset && <selectedPreset.icon className="w-5 h-5 text-indigo-500" />}
                            Apply "{selectedPreset?.label}" Preset?
                        </DialogTitle>
                    </DialogHeader>

                    {selectedPreset && (
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-slate-500">
                                We'll configure your workspace for optimal results.
                            </p>

                            {/* Configuration Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border text-sm space-y-2">
                                    <p className="font-semibold text-xs text-slate-400 uppercase">Configuration</p>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", CONTENT_GOALS.find(g => g.id === selectedPreset.goal)?.color.replace('text-', 'bg-') || 'bg-slate-400')} />
                                        <span>Goal: {CONTENT_GOALS.find(g => g.id === selectedPreset.goal)?.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", CONTENT_FORMATS.find(f => f.id === selectedPreset.format)?.color.replace('text-', 'bg-') || 'bg-slate-400')} />
                                        <span>Format: {CONTENT_FORMATS.find(f => f.id === selectedPreset.format)?.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        <span className="text-xs text-slate-400 mr-1">Platforms:</span>
                                        {selectedPreset.platforms.slice(0, 3).map(p => {
                                            const Icon = getPlatformIcon(p);
                                            return <Icon key={p} className={cn("w-3 h-3", getPlatformColor(p))} />
                                        })}
                                    </div>
                                </div>

                                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800 text-sm space-y-2">
                                    <p className="font-semibold text-xs text-indigo-500 uppercase flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Smart Defaults
                                    </p>
                                    <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
                                        <span className="text-slate-500">Tone:</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{selectedPreset.defaults.tone}</span>

                                        <span className="text-slate-500">CTA:</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{selectedPreset.defaults.ctaStyle}</span>

                                        <span className="text-slate-500">Struct:</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{selectedPreset.defaults.structure}</span>
                                    </div>
                                </div>
                            </div>

                            {/* What's Next Hint */}
                            <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg">
                                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-amber-800 dark:text-amber-200">What you'll need next:</p>
                                    <p className="text-amber-700/80 dark:text-amber-300/80 text-xs mt-1">
                                        Based on this preset, have your <span className="font-medium">Product Name</span> and <span className="font-medium">Target Audience</span> ready for the best results.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setSelectedPreset(null)}>Cancel</Button>
                                <Button onClick={handlePresetConfirm} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    Apply Preset
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Stepper UI */}
            <div className="mb-8 relative z-0">
                <div className="flex items-center justify-between relative">
                    {/* Progress Bar Background */}
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />

                    {STEPS.map((step) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-950 px-4">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                        isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110" :
                                            isCompleted ? "bg-green-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                                    )}
                                >
                                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                                </div>
                                <div className="text-center">
                                    <p className={cn("text-sm font-bold", isActive ? "text-indigo-600" : "text-slate-500")}>{step.label}</p>
                                    <p className="text-[10px] text-slate-400 font-medium hidden sm:block">{step.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* --- STEP 1: STRATEGY (Product + Context) --- */}
            <div className={cn("space-y-6", currentStep !== 1 && "hidden")}>
                {/* 1. Product Row */}
                <Card className="p-4 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-bold">What are we selling?</h2>
                    </div>
                    <div ref={sectionRefs.product} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2"><ShoppingBag className="w-4 h-4" /> Inventory</Button>
                            <Button variant="outline" size="sm" className="gap-2"><Globe className="w-4 h-4" /> Research</Button>
                        </div>

                        <div className="flex-1 w-full">
                            <Input
                                placeholder="Product Name, Description, or URL..."
                                value={product.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProduct({ ...product, name: e.target.value })}
                                className="bg-slate-50 dark:bg-slate-800"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" title="Photo Recognition"><ImageIcon className="w-5 h-5" /></Button>
                            <Button variant="ghost" size="icon" title="Video Recognition"><Video className="w-5 h-5" /></Button>
                        </div>
                    </div>
                </Card>

                {/* 1.5. Intent & Funnel (New) */}
                <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-red-500" />
                        <h2 className="text-lg font-bold">Campaign Intent</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Funnel Stage */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Funnel Stage</label>
                            <div className="flex flex-col gap-2">
                                {FUNNEL_STAGES.map((stage) => (
                                    <button
                                        key={stage.id}
                                        onClick={() => setFunnelStage(stage.id)}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                                            funnelStage === stage.id
                                                ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 dark:bg-indigo-900/20"
                                                : "bg-white dark:bg-slate-900 border-slate-200 hover:border-indigo-300"
                                        )}
                                    >
                                        <span className="text-sm font-medium">{stage.label}</span>
                                        <span className="text-xs text-slate-400">{stage.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Desired Action */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Desired Action</label>
                            <div className="grid grid-cols-2 gap-2">
                                {ACTION_TYPES.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => setActionType(action.id)}
                                        className={cn(
                                            "flex items-center gap-2 p-2 rounded-md border text-xs font-medium transition-all",
                                            actionType === action.id
                                                ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                                                : "bg-white dark:bg-slate-900 border-slate-200 text-slate-600 hover:border-indigo-300"
                                        )}
                                    >
                                        <action.icon className="w-3.5 h-3.5" />
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. Context Blocks */}
                <Card className="p-6 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-bold">Strategy Context</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{completeness.score}%</span>
                            <Progress value={completeness.score} className="w-24 h-2" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {(comboContextSpec?.contextBlocks ?? DEFAULT_CONTEXT_BLOCKS).map((block) => {
                            const isOpenByDefault = block.priority === 'required';
                            const blockKey = `ctx_block_${block.id}`;

                            return (
                                <Collapsible key={blockKey} defaultOpen={isOpenByDefault} className="rounded-lg border bg-slate-50/50 dark:bg-slate-900/40">
                                    <CollapsibleTrigger
                                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{block.title}</span>
                                            <Badge
                                                variant={block.priority === 'required' ? 'default' : block.priority === 'recommended' ? 'secondary' : 'outline'}
                                                className="text-[10px]"
                                            >
                                                {block.priority}
                                            </Badge>
                                        </div>
                                        <span className="text-[11px] text-slate-400">{block.helperText}</span>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="px-3 pb-3">
                                        {block.whyThisMatters && (
                                            <div className="mb-3 p-2 rounded-md bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/40 text-amber-900 dark:text-amber-200 text-xs">
                                                <span className="font-semibold">Why this matters:</span> {block.whyThisMatters}
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {block.fields.map((field) => {
                                                const value = contextValues[field.id] ?? '';

                                                const setValue = (next: string) => {
                                                    if (field.id === 'targetAudience') setBrief((b) => ({ ...b, audience: next }));
                                                    if (field.id === 'offer') setBrief((b) => ({ ...b, offer: next }));
                                                    if (field.id === 'proof') setBrief((b) => ({ ...b, proof: next }));
                                                    if (field.id === 'cta') setBrief((b) => ({ ...b, cta: next }));
                                                    if (field.id === 'brandVoice') setBrief((b) => ({ ...b, brandVoice: next }));
                                                    if (field.id === 'price') setBrief((b) => ({ ...b, price: next }));
                                                    if (field.id === 'shipping') setBrief((b) => ({ ...b, shipping: next }));
                                                    if (field.id === 'exampleCaption') setBrief((b) => ({ ...b, exampleCaption: next }));
                                                };

                                                const chips = (field.id === 'objections')
                                                    ? (brief.objections || [])
                                                    : (field.id === 'usp')
                                                        ? (brief.usps || [])
                                                        : (field.id === 'testimonials')
                                                            ? (brief.testimonials || [])
                                                            : (field.id === 'painPoints')
                                                                ? (brief.painPoints || [])
                                                                : (field.id === 'wordsToUse')
                                                                    ? (brief.wordsToUse || [])
                                                                    : (field.id === 'wordsToAvoid')
                                                                        ? (brief.wordsToAvoid || [])
                                                                        : ([] as string[]);

                                                const addChip = (chip: string) => {
                                                    const trimmed = chip.trim();
                                                    if (!trimmed) return;
                                                    if (field.id === 'objections') {
                                                        setBrief((b) => ({ ...b, objections: Array.from(new Set([...(b.objections || []), trimmed])) }));
                                                    }
                                                    if (field.id === 'usp') {
                                                        setBrief((b) => ({ ...b, usps: Array.from(new Set([...(b.usps || []), trimmed])) }));
                                                    }
                                                    if (field.id === 'testimonials') {
                                                        setBrief((b) => ({ ...b, testimonials: Array.from(new Set([...(b.testimonials || []), trimmed])) }));
                                                    }
                                                    if (field.id === 'painPoints') {
                                                        setBrief((b) => ({ ...b, painPoints: Array.from(new Set([...(b.painPoints || []), trimmed])) }));
                                                    }
                                                    if (field.id === 'wordsToUse') {
                                                        setBrief((b) => ({ ...b, wordsToUse: Array.from(new Set([...(b.wordsToUse || []), trimmed])) }));
                                                    }
                                                    if (field.id === 'wordsToAvoid') {
                                                        setBrief((b) => ({ ...b, wordsToAvoid: Array.from(new Set([...(b.wordsToAvoid || []), trimmed])) }));
                                                    }
                                                };

                                                const removeChip = (chip: string) => {
                                                    if (field.id === 'objections') setBrief((b) => ({ ...b, objections: (b.objections || []).filter((x) => x !== chip) }));
                                                    if (field.id === 'usp') setBrief((b) => ({ ...b, usps: (b.usps || []).filter((x) => x !== chip) }));
                                                    if (field.id === 'testimonials') setBrief((b) => ({ ...b, testimonials: (b.testimonials || []).filter((x) => x !== chip) }));
                                                    if (field.id === 'painPoints') setBrief((b) => ({ ...b, painPoints: (b.painPoints || []).filter((x) => x !== chip) }));
                                                    if (field.id === 'wordsToUse') setBrief((b) => ({ ...b, wordsToUse: (b.wordsToUse || []).filter((x) => x !== chip) }));
                                                    if (field.id === 'wordsToAvoid') setBrief((b) => ({ ...b, wordsToAvoid: (b.wordsToAvoid || []).filter((x) => x !== chip) }));
                                                };

                                                return (
                                                    <div key={field.id} className="space-y-2">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <label className="text-xs font-semibold text-slate-600">{field.label}</label>
                                                                {field.helperText && <p className="text-[11px] text-slate-400">{field.helperText}</p>}
                                                            </div>
                                                            {field.whyThisMatters && (
                                                                <span className="text-[11px] text-slate-400" title={field.whyThisMatters}>Why?</span>
                                                            )}
                                                        </div>

                                                        {field.kind === 'text' && (
                                                            <Input
                                                                value={value}
                                                                onChange={(e) => setValue(e.target.value)}
                                                                placeholder={field.placeholder}
                                                                className="bg-white dark:bg-slate-950"
                                                            />
                                                        )}

                                                        {field.kind === 'textarea' && (
                                                            <Textarea
                                                                value={value}
                                                                onChange={(e) => setValue(e.target.value)}
                                                                placeholder={field.placeholder}
                                                                className="bg-white dark:bg-slate-950 min-h-24"
                                                            />
                                                        )}

                                                        {field.kind === 'slider-group' && field.sliders && (
                                                            <div className="space-y-4 p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                {field.sliders.map(slider => (
                                                                    <div key={slider.id} className="space-y-1">
                                                                        <div className="flex justify-between text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                                                                            <span>{slider.left}</span>
                                                                            <span>{slider.right}</span>
                                                                        </div>
                                                                        <Slider
                                                                            value={[brief.voiceSliders[slider.id] ?? 50]}
                                                                            onValueChange={([val]) => setBrief(b => ({
                                                                                ...b,
                                                                                voiceSliders: { ...b.voiceSliders, [slider.id]: val }
                                                                            }))}
                                                                            max={100}
                                                                            step={10}
                                                                            className="py-1"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {field.kind === 'chips' && (
                                                            <div className="space-y-2">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {chips.map((chip) => (
                                                                        <Badge key={chip} variant="secondary" className="text-[11px]">
                                                                            {chip}
                                                                            <button
                                                                                type="button"
                                                                                className="ml-1 text-slate-500 hover:text-slate-900"
                                                                                onClick={() => removeChip(chip)}
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </Badge>
                                                                    ))}
                                                                </div>

                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        value={chipDrafts[field.id] ?? ''}
                                                                        onChange={(e) => setChipDrafts((d) => ({ ...d, [field.id]: e.target.value }))}
                                                                        placeholder={field.placeholder}
                                                                        className="bg-white dark:bg-slate-950"
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                const next = chipDrafts[field.id] ?? '';
                                                                                addChip(next);
                                                                                setChipDrafts((d) => ({ ...d, [field.id]: '' }));
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="secondary"
                                                                        className="h-10"
                                                                        onClick={() => {
                                                                            const next = chipDrafts[field.id] ?? '';
                                                                            addChip(next);
                                                                            setChipDrafts((d) => ({ ...d, [field.id]: '' }));
                                                                        }}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </div>
                                                                {(field.suggestions || []).length > 0 && (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {(field.suggestions || []).slice(0, 8).map((s) => (
                                                                            <button
                                                                                type="button"
                                                                                key={s}
                                                                                className="text-left"
                                                                                onClick={() => addChip(s)}
                                                                            >
                                                                                <Badge variant="outline" className="text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800">{s}</Badge>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {field.examples && field.examples.length > 0 && (
                                                            <div className="text-[11px] text-slate-400">
                                                                Examples: {field.examples.slice(0, 2).join(' • ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })}
                    </div>
                </Card>
            </div>


            {/* --- STEP 2: STRUCTURE (Goal, Format, Platforms) --- */}
            <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-6", currentStep !== 2 && "hidden")}>

                {/* LEFT: PRESETS & CONTEXT (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Quick Presets (Auto-Config)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {QUICK_PRESETS.map((preset) => {
                            const isSelected = selectedGoal === preset.goal && selectedFormat === preset.format;
                            return (
                                <button
                                    key={preset.id}
                                    onClick={() => handlePresetSelect(preset)}
                                    className={cn(
                                        "relative flex flex-col p-3 rounded-xl transition-all hover:scale-[1.02]",
                                        "bg-slate-900 dark:bg-slate-900 border-2",
                                        isSelected ? "border-transparent bg-gradient-to-br from-indigo-600/20 to-purple-600/20 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20"
                                            : "border-slate-700/50 hover:border-slate-600",
                                        preset.shimmer && isSelected && "animate-pulse-subtle"
                                    )}
                                >
                                    <div className="flex items-start justify-between w-full mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("p-1.5 rounded-lg", isSelected ? "bg-indigo-500/20" : "bg-slate-800")}>
                                                <preset.icon className={cn("w-4 h-4", isSelected ? "text-indigo-400" : "text-slate-400")} />
                                            </div>
                                            <span className={cn("text-sm font-semibold leading-tight text-left", isSelected ? "text-white" : "text-slate-200")}>
                                                {preset.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-auto">
                                        {preset.platforms.slice(0, 3).map((platformId) => {
                                            const PlatformIcon = getPlatformIcon(platformId);
                                            return (
                                                <PlatformIcon key={platformId} className={cn("w-3 h-3", getPlatformColor(platformId))} />
                                            );
                                        })}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-4 bg-gradient-to-br from-amber-950/80 to-orange-950/60 dark:from-amber-950/80 dark:to-orange-950/60 rounded-xl border border-amber-800/30">
                        <div className="flex items-start gap-3 mb-3">
                            <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-base font-semibold text-amber-100 leading-snug">
                                {AI_TIPS_MATRIX[selectedGoal][selectedFormat].headline}
                            </p>
                        </div>
                        <ul className="space-y-2 ml-1">
                            {AI_TIPS_MATRIX[selectedGoal][selectedFormat].tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-amber-200/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* RIGHT: SELECTORS (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-6">
                        {/* 1. Goal Selection */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">1. Marketing Goal</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {CONTENT_GOALS.map((goal) => (
                                    <div
                                        key={goal.id}
                                        onClick={() => setSelectedGoal(goal.id)}
                                        className={cn(
                                            "cursor-pointer p-4 rounded-lg border flex flex-col items-center transition-all",
                                            selectedGoal === goal.id ? cn(goal.bg, "border-current ring-1")
                                                : "bg-white dark:bg-slate-900 hover:bg-slate-50 border-slate-200"
                                        )}
                                    >
                                        <goal.icon className={cn("w-6 h-6 mb-2", goal.color)} />
                                        <span className="font-medium text-sm">{goal.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Format Selection */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">2. Content Format</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {CONTENT_FORMATS.map((format) => (
                                    <div
                                        key={format.id}
                                        onClick={() => setSelectedFormat(format.id)}
                                        className={cn(
                                            "cursor-pointer p-3 rounded-lg border flex flex-col items-center transition-all",
                                            selectedFormat === format.id ? cn(format.bg, "border-current ring-1")
                                                : "bg-white dark:bg-slate-900 hover:bg-slate-50 border-slate-200"
                                        )}
                                    >
                                        <format.icon className={cn("w-5 h-5 mb-1", format.color)} />
                                        <span className="text-xs font-medium">{format.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Platform Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">3. Target Platforms</h3>
                                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    Click to Select • Click again to set Primary
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {PLATFORMS.map((platform) => {
                                    const selected = selectedPlatforms.includes(platform.id);
                                    const isPrimary = primaryPlatform === platform.id;

                                    return (
                                        <button
                                            key={platform.id}
                                            onClick={() => {
                                                if (selected) {
                                                    // If already selected, make it primary (unless it already is, then maybe deselect?)
                                                    if (!isPrimary) {
                                                        setPrimaryPlatform(platform.id);
                                                    } else {
                                                        // Deselect if clicking the primary one
                                                        const next = selectedPlatforms.filter((p) => p !== platform.id);
                                                        setSelectedPlatforms(next);
                                                        // Set new primary if any left
                                                        if (next.length > 0) setPrimaryPlatform(next[0]);
                                                    }
                                                } else {
                                                    // Select it
                                                    const next = [...selectedPlatforms, platform.id];
                                                    setSelectedPlatforms(next);
                                                    // If this is the only one, make it primary
                                                    if (next.length === 1) setPrimaryPlatform(platform.id);
                                                }
                                            }}
                                            className={cn(
                                                "relative flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all overflow-hidden group",
                                                selected
                                                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-offset-1"
                                                    : "bg-white dark:bg-slate-800 hover:bg-slate-50 border-slate-200 text-slate-600",
                                                isPrimary && "ring-2 ring-indigo-500 border-indigo-500"
                                            )}
                                        >
                                            {/* Primary Indicator */}
                                            {isPrimary && (
                                                <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 flex items-center justify-center rounded-bl-md">
                                                    <div className="w-1 h-1 bg-white rounded-full" />
                                                </div>
                                            )}

                                            <platform.icon className={cn("w-4 h-4", selected ? "text-white" : platform.color)} />
                                            <span>{platform.label}</span>

                                            {/* Hover "Make Primary" hint */}
                                            {selected && !isPrimary && (
                                                <span className="absolute inset-0 bg-slate-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white">
                                                    Make Primary
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 4. Platform Constraints (Guardrails) */}
                            {primaryPlatform && PLATFORM_MATRIX[selectedGoal]?.[selectedFormat]?.[primaryPlatform]?.constraints && (
                                <div className="mt-4 p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-indigo-500" />
                                            <h4 className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                                                {PLATFORMS.find(p => p.id === primaryPlatform)?.label} Guardrails
                                            </h4>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-900 text-indigo-500 border-indigo-200">
                                            Primary Platform
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                        {Object.entries(PLATFORM_MATRIX[selectedGoal][selectedFormat][primaryPlatform].constraints).map(([key, value]) => (
                                            <div key={key} className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-200 leading-tight">{value as string}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- STEP 3: CREATIVE (Creation & Edit) --- */}
            <div className={cn("space-y-6", currentStep !== 3 && "hidden")}>

                {/* Header & Switcher */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Palette className="w-5 h-5 text-indigo-500" /> Creation Studio
                        </h2>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setCreationMode('manual')}
                            className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", creationMode === 'manual' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
                        >Manual</button>
                        <button
                            onClick={() => setCreationMode('hybrid')}
                            className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", creationMode === 'hybrid' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500")}
                        >Hybrid</button>
                        <button
                            onClick={() => setCreationMode('auto')}
                            className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", creationMode === 'auto' ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm" : "text-slate-500")}
                        >AI Auto</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: INPUT FORM */}
                    <Card className="p-6 space-y-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        {/* Media Source */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    1. Media Source
                                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">ðŸ’¡ Tip</span>
                                </label>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <Button variant="outline" className="h-20 flex flex-col gap-2 border-dashed border-2 hover:border-indigo-500 transition-colors">
                                    <Sparkles className="w-5 h-5 text-indigo-500" />
                                    <span className="text-[11px]">âœ¨ Generate</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-2 border-dashed border-2 hover:border-blue-400 transition-colors">
                                    <ImageIcon className="w-5 h-5 text-blue-400" />
                                    <span className="text-[11px]">ðŸ“¸ Photo</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-2 border-dashed border-2 hover:border-pink-400 transition-colors">
                                    <Video className="w-5 h-5 text-pink-400" />
                                    <span className="text-[11px]">ðŸŽ¬ Video</span>
                                </Button>
                            </div>
                        </div>

                        {/* Examples Gallery (New) */}
                        {currentMatrix.examples && (
                            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                        <Lightbulb className="w-4 h-4" /> Inspiration Gallery
                                    </label>
                                    <span className="text-[10px] text-slate-400">Click to Apply</span>
                                </div>

                                <Tabs defaultValue="hooks" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 h-8">
                                        <TabsTrigger value="hooks" className="text-xs">Hooks</TabsTrigger>
                                        <TabsTrigger value="ctas" className="text-xs">CTAs</TabsTrigger>
                                        <TabsTrigger value="mistakes" className="text-xs text-red-500">Mistakes</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="hooks" className="space-y-2 mt-2">
                                        {currentMatrix.examples?.hooks?.map((hook: string, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => setContentInput(prev => ({ ...prev, title: hook }))}
                                                className="w-full text-left text-xs p-2 rounded hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-indigo-200 transition-all flex items-start gap-2 group"
                                            >
                                                <span className="text-indigo-500 font-bold opacity-50 group-hover:opacity-100 transition-opacity">“</span>
                                                <span className="flex-1">{hook}</span>
                                            </button>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="ctas" className="space-y-2 mt-2">
                                        {currentMatrix.examples?.ctas?.map((cta: string, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => setContentInput(prev => ({ ...prev, caption: prev.caption ? prev.caption + "\n\n" + cta : cta }))}
                                                className="w-full text-left text-xs p-2 rounded hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-green-200 transition-all flex items-start gap-2 group"
                                            >
                                                <span className="text-green-500 font-bold opacity-50 group-hover:opacity-100 transition-opacity">➜</span>
                                                <span className="flex-1">{cta}</span>
                                            </button>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="mistakes" className="space-y-2 mt-2">
                                        {currentMatrix.examples?.mistakes?.map((mistake: string, i: number) => (
                                            <div key={i} className="text-xs p-2 rounded bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 flex items-start gap-2">
                                                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                <span>{mistake}</span>
                                            </div>
                                        ))}
                                    </TabsContent>
                                </Tabs>
                            </div>
                        )}

                        {/* Core Fields */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-600">2. Core Fields</label>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ðŸ“ {currentMatrix.title}</label>
                                <Input
                                    placeholder={`Enter ${currentMatrix.title}...`}
                                    value={contentInput.title}
                                    onChange={(e) => setContentInput({ ...contentInput, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ðŸ’¬ {currentMatrix.caption}</label>
                                <Textarea
                                    placeholder={`Write ${currentMatrix.caption}...`}
                                    value={contentInput.caption}
                                    onChange={(e) => setContentInput({ ...contentInput, caption: e.target.value })}
                                    className="h-28"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ðŸŽ¨ Tone: {currentMatrix.tone}</label>
                                <Slider defaultValue={[75]} max={100} step={1} className="w-full" />
                            </div>
                        </div>

                        {/* Enhancement Tools */}
                        <div className="pt-4 border-t border-dashed space-y-3">
                            <label className="text-sm font-medium text-slate-600">3. Enhancement Tools</label>
                            <div className="flex flex-wrap gap-2">
                                {(currentMatrix.enhanceTools || []).map((tool: string) => (
                                    <Button key={tool} variant="secondary" className="text-xs h-auto py-2 px-3 flex items-center gap-1.5">
                                        <Wand2 className="w-3.5 h-3.5 text-blue-500" />
                                        <span>{tool}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Output Quality Checklist */}
                        <QualityChecklist
                            goal={selectedGoal}
                            format={selectedFormat}
                            data={{
                                hook: contentInput.title,
                                cta: brief.cta || (contentInput.caption?.includes("Link") ? "Link in bio" : ""), // Simple heuristic fallback
                                offer: brief.offer,
                                proof: brief.proof
                            }}
                            className="mb-2"
                        />

                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 text-md shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate & Optimize
                        </Button>
                    </Card>

                    {/* RIGHT: PREVIEW & EDIT */}
                    <div className="space-y-4">
                        <Card className="overflow-hidden bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                            <div className="p-3 border-b bg-white dark:bg-slate-900 flex justify-between items-center text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-2">
                                    Content Preview
                                    <Badge variant="outline" className="text-[10px]">{currentMatrix.preview || 'Preview'}</Badge>
                                </span>
                            </div>
                            <div className="aspect-[4/5] w-full flex items-center justify-center bg-slate-200/50 dark:bg-slate-900/50 relative">
                                <div className="text-center space-y-3 z-10">
                                    {selectedFormat === 'image' && <ImageIcon className="w-12 h-12 text-slate-400 mx-auto" />}
                                    {selectedFormat === 'reel' && <Video className="w-12 h-12 text-slate-400 mx-auto" />}
                                    {selectedFormat === 'story' && <Layers className="w-12 h-12 text-slate-400 mx-auto" />}
                                    {selectedFormat === 'text' && <Type className="w-12 h-12 text-slate-400 mx-auto" />}
                                    <p className="text-sm text-slate-400">[Generated Content]</p>
                                </div>
                                {(contentInput.title || contentInput.caption) && (
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white pt-12">
                                        <h4 className="font-bold text-lg">{contentInput.title || "Title"}</h4>
                                        <p className="text-sm opacity-90 line-clamp-2">{contentInput.caption || "Caption..."}</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Platform Specific Previews (Horizontal Scroll) */}
                        <div className="mt-6 space-y-3">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Platform Optimization</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {PLATFORMS.filter((p) => selectedPlatforms.includes(p.id)).map((platform) => {
                                    const pData = PLATFORM_MATRIX[selectedGoal][selectedFormat][platform.id] || { ctx: '', type: 'N/A', tools: [] };
                                    return (
                                        <Card key={platform.id} className="p-3 border flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <platform.icon className={cn("w-4 h-4", platform.color)} />
                                                <span className="text-xs font-bold">{platform.label}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 italic">&quot;{pData.ctx}&quot;</p>
                                            <div className="flex flex-wrap gap-1 mt-auto">
                                                {pData.tools.slice(0, 2).map((t: string) => (
                                                    <Badge key={t} variant="outline" className="text-[9px] px-1 py-0 h-5">{t}</Badge>
                                                ))}
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-t z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Left: Tools & Export (if callbacks provided) */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1}
                            className="text-slate-500"
                        >
                            Back
                        </Button>
                        {onHistory && (
                            <Button variant="outline" size="sm" onClick={onHistory} className="gap-1">
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">History</span>
                            </Button>
                        )}
                        {onImport && (
                            <Button variant="outline" size="sm" onClick={onImport} className="gap-1">
                                <Download className="w-3.5 h-3.5 rotate-180" />
                                <span className="hidden sm:inline">Import</span>
                            </Button>
                        )}
                        {onExport && (
                            <Button variant="outline" size="sm" onClick={onExport} className="gap-1">
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        )}
                    </div>

                    {/* Right: Navigation */}
                    <div className="flex gap-2">
                        {currentStep < 3 ? (
                            <Button onClick={() => setCurrentStep(currentStep + 1)} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                                Next Step <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20">
                                Finish & Export <Check className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}