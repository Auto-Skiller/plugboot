"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    className?: string;
    formatValue?: (value: number) => string;
}

/**
 * AnimatedNumber - Number ticker animation for KPI values
 * 
 * Uses framer-motion spring animation for smooth number transitions
 */
export function AnimatedNumber({
    value,
    duration = 1000,
    className,
    formatValue = (v) => Math.round(v).toString(),
}: AnimatedNumberProps) {
    const [isClient, setIsClient] = useState(false);

    // Ensure client-side only rendering for animations
    useEffect(() => {
        setIsClient(true);
    }, []);

    const spring = useSpring(0, {
        stiffness: 100,
        damping: 30,
        duration: duration / 1000,
    });

    const display = useTransform(spring, (current) => formatValue(current));

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    if (!isClient) {
        return <span className={className}>{formatValue(value)}</span>;
    }

    return (
        <motion.span className={className}>
            {display}
        </motion.span>
    );
}
