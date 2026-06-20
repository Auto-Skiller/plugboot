'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleClusterProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    storageKey: string;
    accentColor?: string;
}

export const CollapsibleCluster: React.FC<CollapsibleClusterProps> = ({
    title,
    icon,
    children,
    defaultExpanded = true,
    storageKey,
    accentColor = 'from-gray-600 to-gray-700'
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Persist state in localStorage
    useEffect(() => {
        const stored = localStorage.getItem(`cluster-${storageKey}`);
        if (stored !== null) {
            setIsExpanded(stored === 'true');
        }
    }, [storageKey]);

    const toggleExpanded = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        localStorage.setItem(`cluster-${storageKey}`, String(newState));
    };

    return (
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden transition-all duration-300">
            {/* ✅ RESTRUCTURE: Super Card Header with gradient */}
            <button
                onClick={toggleExpanded}
                className={`w-full flex items-center justify-between p-4 bg-gradient-to-r ${accentColor} text-white hover:opacity-95 transition-opacity`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </button>

            {/* ✅ RESTRUCTURE: Collapsible content with animation */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CollapsibleCluster;
