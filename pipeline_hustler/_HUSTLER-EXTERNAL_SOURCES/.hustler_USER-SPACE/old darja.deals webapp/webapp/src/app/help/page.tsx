"use client";

import { HelpCenterContent } from "@/app/help/_components/HelpCenterContent";
import { useState } from "react";
import { HelpCircle, BookOpen, Headphones } from "lucide-react";
import { InlineTabNavigation } from "@/components/core/ui/tab-navigation";
import { PageHeader } from "@/components/core/layout/PageHeader";

const HELP_TABS = [
    { value: "faq", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
    { value: "guides", label: "Guides", icon: <BookOpen className="w-4 h-4" /> },
    { value: "support", label: "Support", icon: <Headphones className="w-4 h-4" /> },
];

/**
 * HelpCenterPage - Help center with FAQ, guides, and support
 * Migrated to local tab state - functionality preserved
 */
export default function HelpCenterPage() {
    const [activeTab, setActiveTab] = useState("faq");

    return (
        <div className="space-y-6 p-4 md:p-6">
            <PageHeader
                title="Help Center"
                description="Guides and support resources"
                icon={<HelpCircle className="h-6 w-6 text-primary" />}
            />

            <InlineTabNavigation
                tabs={HELP_TABS}
                value={activeTab}
                onChange={setActiveTab}
            />

            <HelpCenterContent activeTab={activeTab} />
        </div>
    );
}
