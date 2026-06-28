"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HelpAssistantWidget } from "./HelpAssistantWidget";
import { MessageCircle, HelpCircle, X, GripVertical, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/core/ui/toast";

const HELP_POSITION_KEY = "riglify-help-widget-position";
const HELP_VISIBILITY_KEY = "riglify-help-widget-visible";
const HELP_OPENED_KEY = "riglify-help-ever-opened";

export function FloatingHelpWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasEverOpened, setHasEverOpened] = useState(true);
    const [defaultPosition, setDefaultPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);
    const { info: showToast } = useToast();

    // Calculate popup direction based on position
    const [popupDirection, setPopupDirection] = useState<{
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'right';
    }>({ vertical: 'top', horizontal: 'left' });

    // Load position, visibility, and first-open state from localStorage
    useEffect(() => {
        const savedPos = localStorage.getItem(HELP_POSITION_KEY);
        if (savedPos) {
            try {
                const parsed = JSON.parse(savedPos);
                setPosition({ x: parsed.x, y: parsed.y });
            } catch (e) {
                console.error("Error loading help position:", e);
            }
        }

        const savedVisibility = localStorage.getItem(HELP_VISIBILITY_KEY);
        if (savedVisibility !== null) {
            setIsVisible(JSON.parse(savedVisibility));
        }

        // Check if user has ever opened the help
        const everOpened = localStorage.getItem(HELP_OPENED_KEY);
        setHasEverOpened(everOpened === 'true');

        // Set default position based on viewport (Bottom Left)
        setDefaultPosition({
            x: 30,
            y: window.innerHeight - 100 // Slightly up from bottom
        });
    }, []);

    // Listen for toggle events from profile menu
    useEffect(() => {
        const handleToggle = () => {
            const saved = localStorage.getItem(HELP_VISIBILITY_KEY);
            if (saved !== null) setIsVisible(JSON.parse(saved));
        };
        window.addEventListener('toggle-help-widget', handleToggle);
        return () => window.removeEventListener('toggle-help-widget', handleToggle);
    }, []);

    // Keyboard shortcut: Ctrl/Cmd + / to toggle help
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Calculate popup direction when position changes or on mount
    useEffect(() => {
        const updateDirection = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                const horizontal = rect.left > viewportWidth / 2 ? 'left' : 'right';
                const vertical = rect.top > viewportHeight / 2 ? 'top' : 'bottom';

                setPopupDirection({ vertical, horizontal });
            }
        };

        updateDirection();
        window.addEventListener('resize', updateDirection);
        return () => window.removeEventListener('resize', updateDirection);
    }, [position, isOpen]);

    // Track drag start to distinguish from click
    const handleDragStart = (_event: any, info: any) => {
        setIsDragging(true);
        dragStartPos.current = { x: info.point.x, y: info.point.y };
    };

    // Snap to nearest edge on drag end
    const handleDragEnd = (_event: any, info: any) => {
        setIsDragging(false);
        const { x, y } = info.point;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const iconSize = 56; // 14 * 4 = 56px
        const margin = 24;

        // Snap to nearest horizontal edge
        const snapX = x < viewportWidth / 2
            ? margin + iconSize / 2
            : viewportWidth - margin - iconSize / 2;

        // Constrain vertical position within viewport
        const snapY = Math.max(
            margin + iconSize / 2,
            Math.min(y, viewportHeight - margin - iconSize / 2)
        );

        const snappedPos = { x: snapX, y: snapY };
        localStorage.setItem(HELP_POSITION_KEY, JSON.stringify(snappedPos));
        setPosition(snappedPos);
    };

    // Handle click - only open if not dragged
    const handleClick = () => {
        if (!dragStartPos.current) {
            openHelp();
            return;
        }

        const currentPos = containerRef.current?.getBoundingClientRect();
        if (currentPos && dragStartPos.current) {
            const distance = Math.sqrt(
                Math.pow(currentPos.x - dragStartPos.current.x, 2) +
                Math.pow(currentPos.y - dragStartPos.current.y, 2)
            );
            // Only open if drag distance is less than 5px (considered a click)
            if (distance < 5) {
                openHelp();
            }
        }
        dragStartPos.current = null;
    };

    // Open help and mark as ever opened
    const openHelp = () => {
        setIsOpen(true);
        if (!hasEverOpened) {
            setHasEverOpened(true);
            localStorage.setItem(HELP_OPENED_KEY, 'true');
        }
    };

    // Handle hide widget with toast notification
    const handleHide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);
        localStorage.setItem(HELP_VISIBILITY_KEY, JSON.stringify(false));

        // Show restoration hint toast
        showToast("Help widget hidden", "Restore it from Profile → Toggles, or press Ctrl + /");
    };

    // Prevent hydration mismatch by waiting for mount
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || !isVisible) return null;

    // Neon Glass Orb Style (Blue Variant) with Enhanced UX
    return (
        <>
            <HelpAssistantWidget
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onMinimize={() => setIsOpen(false)}
                popupDirection={popupDirection}
                anchorRef={containerRef}
                iconPosition={position}
            />

            {/* Floating Button with Entrance Animation */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        ref={containerRef}
                        drag
                        dragMomentum={false}
                        dragElastic={0.1}
                        dragConstraints={{
                            top: 60,
                            left: 30,
                            right: window.innerWidth - 86,
                            bottom: window.innerHeight - 86
                        }}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="fixed top-0 left-0 z-[9999] flex flex-col items-end"
                        animate={position ? {
                            x: position.x,
                            y: position.y,
                            opacity: 1,
                            scale: 1
                        } : {
                            x: defaultPosition.x,
                            y: defaultPosition.y,
                            opacity: 1,
                            scale: 1
                        }}
                        initial={{ opacity: 0, scale: 0.8, x: defaultPosition.x, y: defaultPosition.y }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <button
                            onClick={handleClick}
                            className={`
                                relative w-14 h-14 rounded-full 
                                bg-black/60 backdrop-blur-xl border border-white/10 
                                shadow-[0_0_20px_rgba(59,130,246,0.2)] 
                                hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] 
                                hover:bg-black/70 transition-all duration-300 
                                flex items-center justify-center group
                                ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                                ${!hasEverOpened ? 'animate-pulse' : ''}
                            `}
                            title="Help & Support (Ctrl + /)"
                        >
                            {/* Internal Glow Gradient */}
                            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />

                            {/* Icon - Sparkles */}
                            <Sparkles
                                className="h-7 w-7 relative z-10 text-blue-400 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                            />

                            {/* Drag indicator on hover */}
                            {isHovered && !isDragging && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-zinc-500 whitespace-nowrap"
                                >
                                    Drag to move
                                </motion.div>
                            )}
                        </button>

                        {/* Close Button on Hover */}
                        <AnimatePresence>
                            {isHovered && !isDragging && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={handleHide}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
                                    title="Hide widget"
                                >
                                    <X className="h-3 w-3 text-white" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
