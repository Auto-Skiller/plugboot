"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export type PlanType = 'starter' | 'pro' | 'enterprise';

export interface UsageMetrics {
    orders: { used: number; max: number };
    stores: { used: number; max: number };
    ai_credits: { used: number; max: number };
}

export interface Invoice {
    id: string;
    date: string; // ISO string for storage
    amount: number;
    status: 'paid' | 'pending';
}

interface BillingContextType {
    plan: PlanType;
    credits: number;
    usage: UsageMetrics;
    invoices: Invoice[];
    isLoading: boolean;
    upgradePlan: (planId: PlanType) => void;
    addCredits: (amount: number) => void;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

const DEFAULT_USAGE: UsageMetrics = {
    orders: { used: 87, max: 100 },
    stores: { used: 1, max: 1 },
    ai_credits: { used: 450, max: 500 },
};

const DEFAULT_INVOICES: Invoice[] = [
    { id: '1', date: new Date('2024-11-01').toISOString(), amount: 4900, status: 'paid' },
    { id: '2', date: new Date('2024-10-01').toISOString(), amount: 4900, status: 'paid' },
    { id: '3', date: new Date('2024-09-01').toISOString(), amount: 4900, status: 'paid' },
];

export function BillingProvider({ children }: { children: React.ReactNode }) {
    const [plan, setPlan] = useState<PlanType>('starter');
    const [credits, setCredits] = useState(0);
    const [usage, setUsage] = useState<UsageMetrics>(DEFAULT_USAGE);
    const [invoices, setInvoices] = useState<Invoice[]>(DEFAULT_INVOICES);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("ecoma-billing-state");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setPlan(parsed.plan || 'starter');
                setCredits(parsed.credits || 0);
                setUsage(parsed.usage || DEFAULT_USAGE);
                setInvoices(parsed.invoices || DEFAULT_INVOICES);
            } catch (e) {
                console.error("Failed to parse billing state", e);
            }
        }
        setIsLoading(false);
    }, []);

    const saveState = (newState: any) => {
        localStorage.setItem("ecoma-billing-state", JSON.stringify(newState));
    };

    const upgradePlan = (newPlan: PlanType) => {
        setPlan(newPlan);
        // Update limits based on plan
        const newUsage = { ...usage };
        if (newPlan === 'pro') {
            newUsage.orders.max = 1000000; // Unlimited roughly
            newUsage.stores.max = 5;
            newUsage.ai_credits.max = 2000;
        } else if (newPlan === 'enterprise') {
            newUsage.orders.max = 1000000;
            newUsage.stores.max = 100;
            newUsage.ai_credits.max = 10000;
        } else {
            newUsage.orders.max = 100;
            newUsage.stores.max = 1;
            newUsage.ai_credits.max = 500;
        }
        setUsage(newUsage);

        saveState({ plan: newPlan, credits: credits, usage: newUsage, invoices: invoices }); // Use current values explicitly
        toast.success(`Successfully upgraded to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} plan!`);
    };

    const addCredits = (amount: number) => {
        const newCredits = credits + amount;
        setCredits(newCredits);

        // Generate a new invoice
        const newInvoice: Invoice = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            amount: amount,
            status: 'paid'
        };
        const newInvoices = [newInvoice, ...invoices];
        setInvoices(newInvoices);

        saveState({ plan, credits: newCredits, usage, invoices: newInvoices });
        toast.success(`Added ${amount.toLocaleString()} DA to wallet`);
    };

    return (
        <BillingContext.Provider value={{
            plan,
            credits,
            usage,
            invoices,
            isLoading,
            upgradePlan,
            addCredits
        }}>
            {children}
        </BillingContext.Provider>
    );
}

export function useBilling() {
    const context = useContext(BillingContext);
    if (context === undefined) {
        throw new Error("useBilling must be used within a BillingProvider");
    }
    return context;
}
