"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { wilayas, type Wilaya, algeriaColors } from "@/lib/chart-utils";
import { cn } from "@/lib/utils";
import { MapPin, TrendingUp, Users, Package } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface WilayaMapData {
    code: string;
    value: number;
    label?: string;
    subLabel?: string;
    color?: string;
    trend?: "up" | "down" | "neutral";
}

interface AlgeriaMapProps {
    data: WilayaMapData[];
    onWilayaClick?: (wilaya: Wilaya) => void;
    selectedWilaya?: string;
    className?: string;
    height?: number | string;
}

// ============================================================================
// ALGERIA MAP COMPONENT (DOT MAP)
// ============================================================================

export function AlgeriaMap({
    data,
    onWilayaClick,
    selectedWilaya,
    className,
    height = 500,
}: AlgeriaMapProps) {
    const [hoveredWilaya, setHoveredWilaya] = useState<string | null>(null);

    // Normalize data for sizing
    const maxValue = Math.max(...data.map(d => d.value), 1);

    // Map dimensions (approximate aspect ratio of Algeria)
    const mapWidth = 600;
    const mapHeight = 500;

    // Coordinate bounds for Algeria (approximate)
    const bounds = {
        minLat: 18.0, // South
        maxLat: 37.5, // North
        minLng: -9.0, // West
        maxLng: 12.0, // East
    };

    // Project lat/lng to x/y
    const project = (lat: number, lng: number) => {
        const latRange = bounds.maxLat - bounds.minLat;
        const lngRange = bounds.maxLng - bounds.minLng;

        // Simple linear projection (sufficient for this visualization)
        const x = ((lng - bounds.minLng) / lngRange) * mapWidth;
        const y = mapHeight - ((lat - bounds.minLat) / latRange) * mapHeight;

        return { x, y };
    };

    return (
        <div
            className={cn("relative w-full bg-slate-50/50 dark:bg-slate-900/20 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800", className)}
            style={{ height }}
        >
            {/* Map Background / Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                    backgroundSize: "20px 20px"
                }}
            />

            {/* Map Container */}
            <div className="relative w-full h-full flex items-center justify-center">
                <div style={{ width: mapWidth, height: mapHeight, position: 'relative' }}>

                    {/* Render Dots for each Wilaya */}
                    {wilayas.map((wilaya) => {
                        const wilayaData = data.find(d => d.code === wilaya.code);
                        const value = wilayaData?.value || 0;
                        const isSelected = selectedWilaya === wilaya.code;
                        const isHovered = hoveredWilaya === wilaya.code;

                        // Calculate size based on value (min 4px, max 24px)
                        const size = value > 0
                            ? 6 + (value / maxValue) * 24
                            : 4;

                        const { x, y } = project(wilaya.coordinates.lat, wilaya.coordinates.lng);

                        // Determine color
                        const baseColor = wilayaData?.color || (value > 0 ? algeriaColors.heatmap.medium : "#cbd5e1");
                        const activeColor = isSelected ? algeriaColors.heatmap.veryHigh : baseColor;

                        return (
                            <motion.div
                                key={wilaya.code}
                                className="absolute cursor-pointer z-10"
                                style={{ left: x, top: y }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: isHovered ? 1.2 : 1,
                                    opacity: 1,
                                    zIndex: isHovered || isSelected ? 50 : 10
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                onMouseEnter={() => setHoveredWilaya(wilaya.code)}
                                onMouseLeave={() => setHoveredWilaya(null)}
                                onClick={() => onWilayaClick?.(wilaya)}
                            >
                                {/* Pulse effect for high value or selected */}
                                {(isSelected || (value / maxValue > 0.7)) && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full"
                                        style={{ backgroundColor: activeColor }}
                                        animate={{ scale: [1, 2], opacity: [0.4, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}

                                {/* The Dot */}
                                <div
                                    className={cn(
                                        "rounded-full shadow-sm border border-white dark:border-slate-900 transition-colors duration-300",
                                        isSelected && "ring-2 ring-offset-2 ring-primary ring-offset-white dark:ring-offset-slate-950"
                                    )}
                                    style={{
                                        width: size,
                                        height: size,
                                        backgroundColor: activeColor,
                                        transform: 'translate(-50%, -50%)' // Center the dot
                                    }}
                                />

                                {/* Tooltip */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                                        >
                                            <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-lg shadow-xl p-3 min-w-[140px] border border-slate-100 dark:border-slate-700">
                                                <div className="font-bold text-sm mb-1 flex items-center justify-between">
                                                    <span>{wilaya.nameFr}</span>
                                                    <span className="text-muted-foreground text-[10px]">{wilaya.code}</span>
                                                </div>
                                                <div className="text-muted-foreground text-[10px] mb-2">{wilaya.nameAr}</div>

                                                {wilayaData ? (
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-muted-foreground">Orders</span>
                                                            <span className="font-bold">{wilayaData.value}</span>
                                                        </div>
                                                        {wilayaData.subLabel && (
                                                            <div className="flex justify-between items-center text-[10px]">
                                                                <span className="text-muted-foreground">Revenue</span>
                                                                <span className="font-medium text-green-600 dark:text-green-400">{wilayaData.subLabel}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-muted-foreground italic">No active orders</div>
                                                )}
                                            </div>
                                            {/* Arrow */}
                                            <div className="w-3 h-3 bg-white dark:bg-slate-800 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-slate-100 dark:border-slate-700"></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Legend / Controls Overlay */}
            <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
                <div className="font-semibold mb-2">Order Density</div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#7C3AED]"></div>
                    <span>High Volume</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                    <span>Medium Volume</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#93C5FD]"></div>
                    <span>Low Volume</span>
                </div>
            </div>
        </div >
    );
}
