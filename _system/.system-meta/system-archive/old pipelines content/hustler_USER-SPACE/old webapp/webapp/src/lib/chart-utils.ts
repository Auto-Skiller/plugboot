"use client";

import * as React from "react";

// ============================================================================
// ADVANCED CHART COLOR UTILITIES
// ============================================================================

// Generate color palette from a single base color
export function generateColorPalette(baseHue: number, count: number = 6): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
        const hue = (baseHue + i * (360 / count)) % 360;
        const saturation = 70 + (i % 2) * 10; // Alternate between 70% and 80%
        const lightness = 50 + (i % 3) * 5; // Vary lightness slightly
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
}

// Anthropic brand color schemes
export const brandColors = {
    // Core brand colors
    core: {
        dark: "#141413",
        light: "#faf9f5",
        midGray: "#b0aea5",
        lightGray: "#e8e6dc",
    },
    // Accent colors
    accents: {
        orange: "#d97757",
        blue: "#6a9bcc",
        green: "#788c5d",
    },
    // Delivery company brand colors (unchanged - vendor specific)
    deliveryCompanies: {
        yalidine: "#FF6B00", // Orange
        maystro: "#2563EB", // Blue
        zrExpress: "#16A34A", // Green
        ecotrack: "#7C3AED", // Purple
        procolis: "#DC2626", // Red
        flash: "#F59E0B", // Amber
    },
    // Regional heat map gradient - using brand palette
    heatmap: {
        low: "#e8e6dc",      // Light Gray
        medium: "#6a9bcc",   // Blue
        high: "#d97757",     // Orange
        veryHigh: "#788c5d", // Green for hotspots
    },
    // Status colors (consistent with order status)
    status: {
        new: "#6a9bcc",       // Blue
        confirmed: "#788c5d", // Green
        shipped: "#d97757",   // Orange
        inTransit: "#6a9bcc", // Blue
        delivered: "#788c5d", // Green
        returned: "#d97757",  // Orange
        cancelled: "#b0aea5", // Mid Gray
    },
};

// Legacy alias for backward compatibility
export const algeriaColors = brandColors;

// Color blind safe palette
export const colorBlindSafe = [
    "#0072B2", // Blue
    "#E69F00", // Orange
    "#009E73", // Green
    "#CC79A7", // Pink
    "#F0E442", // Yellow
    "#56B4E9", // Light blue
    "#D55E00", // Red-orange
    "#000000", // Black
];

// Pattern definitions for accessibility
export const chartPatterns = {
    stripes: (color: string) => `
    <pattern id="stripes-${color.replace('#', '')}" patternUnits="userSpaceOnUse" width="8" height="8">
      <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="${color}" stroke-width="2"/>
    </pattern>
  `,
    dots: (color: string) => `
    <pattern id="dots-${color.replace('#', '')}" patternUnits="userSpaceOnUse" width="8" height="8">
      <circle cx="4" cy="4" r="2" fill="${color}"/>
    </pattern>
  `,
    crosshatch: (color: string) => `
    <pattern id="crosshatch-${color.replace('#', '')}" patternUnits="userSpaceOnUse" width="8" height="8">
      <path d="M0,0 l8,8 M8,0 l-8,8" stroke="${color}" stroke-width="1"/>
    </pattern>
  `,
};

// ============================================================================
// TIMEZONE HANDLING (Algeria = CET/UTC+1)
// ============================================================================

export const ALGERIA_TIMEZONE = "Africa/Algiers";
export const ALGERIA_UTC_OFFSET = 1; // UTC+1

export function toAlgeriaTime(date: Date | string): Date {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Date(d.toLocaleString("en-US", { timeZone: ALGERIA_TIMEZONE }));
}

export function formatAlgeriaDate(date: Date | string, format: "short" | "long" | "time" = "short"): string {
    const d = typeof date === "string" ? new Date(date) : date;

    const options: Intl.DateTimeFormatOptions = {
        timeZone: ALGERIA_TIMEZONE,
        ...(format === "short" && { day: "2-digit", month: "2-digit", year: "numeric" }),
        ...(format === "long" && { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        ...(format === "time" && { hour: "2-digit", minute: "2-digit", hour12: false }),
    };

    return d.toLocaleString("fr-DZ", options);
}

export function formatAlgeriaDateTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("fr-DZ", {
        timeZone: ALGERIA_TIMEZONE,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

// Get current time in Algeria
export function getAlgeriaTime(): Date {
    return toAlgeriaTime(new Date());
}

// Check if it's business hours in Algeria (8:00-18:00)
export function isAlgeriaBusinessHours(): boolean {
    const now = getAlgeriaTime();
    const hour = now.getHours();
    const day = now.getDay();
    // Algeria work week: Sunday-Thursday (Friday-Saturday off)
    const isWeekday = day >= 0 && day <= 4;
    const isBusinessHour = hour >= 8 && hour < 18;
    return isWeekday && isBusinessHour;
}

// Check if it's Algeria weekend (Friday-Saturday)
export function isAlgeriaWeekend(): boolean {
    const day = getAlgeriaTime().getDay();
    return day === 5 || day === 6; // Friday or Saturday
}

// Get relative time in Algeria context
export function getRelativeTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
    return formatAlgeriaDate(d, "short");
}

// ============================================================================
// ALGERIA WILAYA DATA
// ============================================================================

export interface Wilaya {
    code: string;
    name: string;
    nameFr: string;
    nameAr: string;
    region: "north" | "center" | "west" | "east" | "south";
    population: number;
    coordinates: { lat: number; lng: number };
}

export const wilayas: Wilaya[] = [
    { code: "01", name: "Adrar", nameFr: "Adrar", nameAr: "أدرار", region: "south", population: 440000, coordinates: { lat: 27.88, lng: -0.29 } },
    { code: "02", name: "Chlef", nameFr: "Chlef", nameAr: "الشلف", region: "west", population: 1140000, coordinates: { lat: 36.17, lng: 1.33 } },
    { code: "03", name: "Laghouat", nameFr: "Laghouat", nameAr: "الأغواط", region: "south", population: 520000, coordinates: { lat: 33.80, lng: 2.88 } },
    { code: "04", name: "Oum El Bouaghi", nameFr: "Oum El Bouaghi", nameAr: "أم البواقي", region: "east", population: 740000, coordinates: { lat: 35.88, lng: 7.12 } },
    { code: "05", name: "Batna", nameFr: "Batna", nameAr: "باتنة", region: "east", population: 1280000, coordinates: { lat: 35.55, lng: 6.17 } },
    { code: "06", name: "Bejaia", nameFr: "Béjaïa", nameAr: "بجاية", region: "east", population: 990000, coordinates: { lat: 36.75, lng: 5.07 } },
    { code: "07", name: "Biskra", nameFr: "Biskra", nameAr: "بسكرة", region: "south", population: 850000, coordinates: { lat: 34.85, lng: 5.73 } },
    { code: "08", name: "Bechar", nameFr: "Béchar", nameAr: "بشار", region: "south", population: 310000, coordinates: { lat: 31.62, lng: -2.22 } },
    { code: "09", name: "Blida", nameFr: "Blida", nameAr: "البليدة", region: "center", population: 1200000, coordinates: { lat: 36.47, lng: 2.83 } },
    { code: "10", name: "Bouira", nameFr: "Bouira", nameAr: "البويرة", region: "center", population: 780000, coordinates: { lat: 36.38, lng: 3.90 } },
    { code: "11", name: "Tamanrasset", nameFr: "Tamanrasset", nameAr: "تمنراست", region: "south", population: 220000, coordinates: { lat: 22.79, lng: 5.53 } },
    { code: "12", name: "Tebessa", nameFr: "Tébessa", nameAr: "تبسة", region: "east", population: 720000, coordinates: { lat: 35.40, lng: 8.12 } },
    { code: "13", name: "Tlemcen", nameFr: "Tlemcen", nameAr: "تلمسان", region: "west", population: 1020000, coordinates: { lat: 34.88, lng: -1.32 } },
    { code: "14", name: "Tiaret", nameFr: "Tiaret", nameAr: "تيارت", region: "west", population: 900000, coordinates: { lat: 35.37, lng: 1.32 } },
    { code: "15", name: "Tizi Ouzou", nameFr: "Tizi Ouzou", nameAr: "تيزي وزو", region: "center", population: 1180000, coordinates: { lat: 36.72, lng: 4.05 } },
    { code: "16", name: "Algiers", nameFr: "Alger", nameAr: "الجزائر", region: "center", population: 3500000, coordinates: { lat: 36.75, lng: 3.06 } },
    { code: "17", name: "Djelfa", nameFr: "Djelfa", nameAr: "الجلفة", region: "south", population: 1400000, coordinates: { lat: 34.67, lng: 3.25 } },
    { code: "18", name: "Jijel", nameFr: "Jijel", nameAr: "جيجل", region: "east", population: 700000, coordinates: { lat: 36.82, lng: 5.77 } },
    { code: "19", name: "Setif", nameFr: "Sétif", nameAr: "سطيف", region: "east", population: 1700000, coordinates: { lat: 36.19, lng: 5.41 } },
    { code: "20", name: "Saida", nameFr: "Saïda", nameAr: "سعيدة", region: "west", population: 400000, coordinates: { lat: 34.83, lng: 0.15 } },
    { code: "21", name: "Skikda", nameFr: "Skikda", nameAr: "سكيكدة", region: "east", population: 1000000, coordinates: { lat: 36.88, lng: 6.90 } },
    { code: "22", name: "Sidi Bel Abbes", nameFr: "Sidi Bel Abbès", nameAr: "سيدي بلعباس", region: "west", population: 680000, coordinates: { lat: 35.19, lng: -0.63 } },
    { code: "23", name: "Annaba", nameFr: "Annaba", nameAr: "عنابة", region: "east", population: 700000, coordinates: { lat: 36.90, lng: 7.77 } },
    { code: "24", name: "Guelma", nameFr: "Guelma", nameAr: "قالمة", region: "east", population: 530000, coordinates: { lat: 36.47, lng: 7.43 } },
    { code: "25", name: "Constantine", nameFr: "Constantine", nameAr: "قسنطينة", region: "east", population: 1050000, coordinates: { lat: 36.37, lng: 6.61 } },
    { code: "26", name: "Medea", nameFr: "Médéa", nameAr: "المدية", region: "center", population: 900000, coordinates: { lat: 36.27, lng: 2.75 } },
    { code: "27", name: "Mostaganem", nameFr: "Mostaganem", nameAr: "مستغانم", region: "west", population: 800000, coordinates: { lat: 35.93, lng: 0.08 } },
    { code: "28", name: "M'Sila", nameFr: "M'Sila", nameAr: "المسيلة", region: "center", population: 1200000, coordinates: { lat: 35.70, lng: 4.55 } },
    { code: "29", name: "Mascara", nameFr: "Mascara", nameAr: "معسكر", region: "west", population: 850000, coordinates: { lat: 35.40, lng: 0.14 } },
    { code: "30", name: "Ouargla", nameFr: "Ouargla", nameAr: "ورقلة", region: "south", population: 620000, coordinates: { lat: 31.95, lng: 5.33 } },
    { code: "31", name: "Oran", nameFr: "Oran", nameAr: "وهران", region: "west", population: 1600000, coordinates: { lat: 35.70, lng: -0.63 } },
    { code: "32", name: "El Bayadh", nameFr: "El Bayadh", nameAr: "البيض", region: "south", population: 300000, coordinates: { lat: 33.68, lng: 1.02 } },
    { code: "33", name: "Illizi", nameFr: "Illizi", nameAr: "إليزي", region: "south", population: 70000, coordinates: { lat: 26.48, lng: 8.48 } },
    { code: "34", name: "Bordj Bou Arreridj", nameFr: "Bordj Bou Arréridj", nameAr: "برج بوعريريج", region: "east", population: 750000, coordinates: { lat: 36.07, lng: 4.76 } },
    { code: "35", name: "Boumerdes", nameFr: "Boumerdès", nameAr: "بومرداس", region: "center", population: 980000, coordinates: { lat: 36.77, lng: 3.48 } },
    { code: "36", name: "El Tarf", nameFr: "El Tarf", nameAr: "الطارف", region: "east", population: 450000, coordinates: { lat: 36.77, lng: 8.31 } },
    { code: "37", name: "Tindouf", nameFr: "Tindouf", nameAr: "تندوف", region: "south", population: 80000, coordinates: { lat: 27.67, lng: -8.15 } },
    { code: "38", name: "Tissemsilt", nameFr: "Tissemsilt", nameAr: "تيسمسيلت", region: "west", population: 330000, coordinates: { lat: 35.61, lng: 1.81 } },
    { code: "39", name: "El Oued", nameFr: "El Oued", nameAr: "الوادي", region: "south", population: 750000, coordinates: { lat: 33.37, lng: 6.87 } },
    { code: "40", name: "Khenchela", nameFr: "Khenchela", nameAr: "خنشلة", region: "east", population: 420000, coordinates: { lat: 35.44, lng: 7.14 } },
    { code: "41", name: "Souk Ahras", nameFr: "Souk Ahras", nameAr: "سوق أهراس", region: "east", population: 500000, coordinates: { lat: 36.29, lng: 7.95 } },
    { code: "42", name: "Tipaza", nameFr: "Tipaza", nameAr: "تيبازة", region: "center", population: 700000, coordinates: { lat: 36.59, lng: 2.45 } },
    { code: "43", name: "Mila", nameFr: "Mila", nameAr: "ميلة", region: "east", population: 850000, coordinates: { lat: 36.45, lng: 6.26 } },
    { code: "44", name: "Ain Defla", nameFr: "Aïn Defla", nameAr: "عين الدفلى", region: "west", population: 850000, coordinates: { lat: 36.25, lng: 1.97 } },
    { code: "45", name: "Naama", nameFr: "Naâma", nameAr: "النعامة", region: "south", population: 250000, coordinates: { lat: 33.27, lng: -0.31 } },
    { code: "46", name: "Ain Temouchent", nameFr: "Aïn Témouchent", nameAr: "عين تموشنت", region: "west", population: 420000, coordinates: { lat: 35.30, lng: -1.14 } },
    { code: "47", name: "Ghardaia", nameFr: "Ghardaïa", nameAr: "غرداية", region: "south", population: 450000, coordinates: { lat: 32.49, lng: 3.67 } },
    { code: "48", name: "Relizane", nameFr: "Relizane", nameAr: "غليزان", region: "west", population: 800000, coordinates: { lat: 35.74, lng: 0.56 } },
    // New Wilayas (2019/2021)
    { code: "49", name: "Timimoun", nameFr: "Timimoun", nameAr: "تيميمون", region: "south", population: 122000, coordinates: { lat: 29.26, lng: 0.23 } },
    { code: "50", name: "Bordj Badji Mokhtar", nameFr: "Bordj Badji Mokhtar", nameAr: "برج باجي مختار", region: "south", population: 22000, coordinates: { lat: 21.33, lng: 0.95 } },
    { code: "51", name: "Ouled Djellal", nameFr: "Ouled Djellal", nameAr: "أولاد جلال", region: "south", population: 174000, coordinates: { lat: 34.43, lng: 5.06 } },
    { code: "52", name: "Beni Abbes", nameFr: "Béni Abbès", nameAr: "بني عباس", region: "south", population: 50000, coordinates: { lat: 30.12, lng: -2.17 } },
    { code: "53", name: "In Salah", nameFr: "In Salah", nameAr: "عين صالح", region: "south", population: 50000, coordinates: { lat: 27.19, lng: 2.48 } },
    { code: "54", name: "In Guezzam", nameFr: "In Guezzam", nameAr: "عين قزام", region: "south", population: 11000, coordinates: { lat: 19.57, lng: 5.77 } },
    { code: "55", name: "Touggourt", nameFr: "Touggourt", nameAr: "تقرت", region: "south", population: 147000, coordinates: { lat: 33.10, lng: 6.06 } },
    { code: "56", name: "Djanet", nameFr: "Djanet", nameAr: "جانت", region: "south", population: 17000, coordinates: { lat: 24.55, lng: 9.48 } },
    { code: "57", name: "El M'Ghair", nameFr: "El M'Ghair", nameAr: "المغير", region: "south", population: 72000, coordinates: { lat: 33.95, lng: 5.92 } },
    { code: "58", name: "El Meniaa", nameFr: "El Meniaa", nameAr: "المنيعة", region: "south", population: 57000, coordinates: { lat: 30.58, lng: 2.88 } },
];

// Get wilaya by code
export function getWilayaByCode(code: string): Wilaya | undefined {
    return wilayas.find(w => w.code === code);
}

// Get wilayas by region
export function getWilayasByRegion(region: Wilaya["region"]): Wilaya[] {
    return wilayas.filter(w => w.region === region);
}

// ============================================================================
// DELIVERY COMPANY DATA
// ============================================================================

export interface DeliveryCompany {
    id: string;
    name: string;
    color: string;
    logo?: string;
    avgDeliveryDays: number;
    coverage: number; // percentage of wilayas covered
    pricing: {
        base: number;
        perKg: number;
    };
}

export const deliveryCompanies: DeliveryCompany[] = [
    {
        id: "yalidine",
        name: "Yalidine",
        color: "#FF6B00",
        avgDeliveryDays: 2.5,
        coverage: 100,
        pricing: { base: 400, perKg: 50 },
    },
    {
        id: "maystro",
        name: "Maystro Delivery",
        color: "#2563EB",
        avgDeliveryDays: 2,
        coverage: 85,
        pricing: { base: 350, perKg: 45 },
    },
    {
        id: "zr_express",
        name: "ZR Express",
        color: "#16A34A",
        avgDeliveryDays: 3,
        coverage: 90,
        pricing: { base: 380, perKg: 40 },
    },
    {
        id: "ecotrack",
        name: "Ecotrack",
        color: "#7C3AED",
        avgDeliveryDays: 2.8,
        coverage: 75,
        pricing: { base: 320, perKg: 55 },
    },
    {
        id: "flash",
        name: "Flash Delivery",
        color: "#F59E0B",
        avgDeliveryDays: 1.5,
        coverage: 60,
        pricing: { base: 500, perKg: 60 },
    },
];

export function getDeliveryCompanyById(id: string): DeliveryCompany | undefined {
    return deliveryCompanies.find(c => c.id === id);
}
