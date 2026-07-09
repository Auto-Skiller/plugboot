"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Plus, Trash2, Calculator, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Cost {
    id: string;
    description: string;
    amount: string;
}

export function ProfitCalculator() {
    const [basis, setBasis] = useState<"confirmed" | "delivered">("confirmed");
    const [productCost, setProductCost] = useState("");
    const [shippingCost, setShippingCost] = useState("");
    const [confirmationCost, setConfirmationCost] = useState("");
    const [adCost, setAdCost] = useState("");
    const [additionalCosts, setAdditionalCosts] = useState<Cost[]>([]);
    const [sellingPrice, setSellingPrice] = useState("");
    const [orders, setOrders] = useState("");
    const [confirmationRate, setConfirmationRate] = useState("60");
    const [deliveryRate, setDeliveryRate] = useState("85");

    const addCost = () => {
        setAdditionalCosts([
            ...additionalCosts,
            { id: Date.now().toString(), description: "", amount: "" },
        ]);
    };

    const removeCost = (id: string) => {
        setAdditionalCosts(additionalCosts.filter((cost) => cost.id !== id));
    };

    const updateCost = (id: string, field: "description" | "amount", value: string) => {
        setAdditionalCosts(
            additionalCosts.map((cost) =>
                cost.id === id ? { ...cost, [field]: value } : cost
            )
        );
    };

    // Calculate profit
    const calculateProfit = () => {
        const numOrders = parseFloat(orders) || 0;
        const price = parseFloat(sellingPrice) || 0;
        const product = parseFloat(productCost) || 0;
        const shipping = parseFloat(shippingCost) || 0;
        const confirmation = parseFloat(confirmationCost) || 0;
        const ads = parseFloat(adCost) || 0;
        const confRate = parseFloat(confirmationRate) / 100;
        const delRate = parseFloat(deliveryRate) / 100;

        const additionalTotal = additionalCosts.reduce(
            (sum, cost) => sum + (parseFloat(cost.amount) || 0),
            0
        );

        const confirmedOrders = numOrders * confRate;
        const deliveredOrders = confirmedOrders * delRate;
        const effectiveOrders = basis === "confirmed" ? confirmedOrders : deliveredOrders;

        const revenue = effectiveOrders * price;
        const totalCosts =
            effectiveOrders * (product + shipping) +
            confirmedOrders * confirmation +
            ads +
            additionalTotal;

        const profit = revenue - totalCosts;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return { profit, margin, revenue, totalCosts, effectiveOrders };
    };

    const results = calculateProfit();

    return (
        <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Calculator className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Calculateur de Profit
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Basis Toggle */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <Button
                        variant={basis === "confirmed" ? "default" : "ghost"}
                        className={cn(
                            "flex-1 transition-all",
                            basis === "confirmed"
                                ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500"
                                : "hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-slate-300"
                        )}
                        onClick={() => setBasis("confirmed")}
                    >
                        Par confirmée
                    </Button>
                    <Button
                        variant={basis === "delivered" ? "default" : "ghost"}
                        className={cn(
                            "flex-1 transition-all",
                            basis === "delivered"
                                ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500"
                                : "hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-slate-300"
                        )}
                        onClick={() => setBasis("delivered")}
                    >
                        Par livrée
                    </Button>
                </div>

                {/* Orders & Rates */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Données de vente</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-600 dark:text-slate-400">Commandes totales</Label>
                            <Input
                                type="number"
                                placeholder="100"
                                value={orders}
                                onChange={(e) => setOrders(e.target.value)}
                                className="dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-slate-600 dark:text-slate-400">Prix de vente (DA)</Label>
                            <Input
                                type="number"
                                placeholder="3500"
                                value={sellingPrice}
                                onChange={(e) => setSellingPrice(e.target.value)}
                                className="dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-slate-600 dark:text-slate-400">Taux confirmation (%)</Label>
                            <Input
                                type="number"
                                placeholder="60"
                                value={confirmationRate}
                                onChange={(e) => setConfirmationRate(e.target.value)}
                                className="dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-slate-600 dark:text-slate-400">Taux livraison (%)</Label>
                            <Input
                                type="number"
                                placeholder="85"
                                value={deliveryRate}
                                onChange={(e) => setDeliveryRate(e.target.value)}
                                className="dark:border-slate-600 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Expenses */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Dépenses principales</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-600 dark:text-slate-400">Coût produit (DA)</Label>
                            <Input
                                type="number"
                                placeholder="800"
                                value={productCost}
                                onChange={(e) => setProductCost(e.target.value)}
                                className="dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-slate-600 dark:text-slate-400">Frais livraison (DA)</Label>
                            <Input
                                type="number"
                                placeholder="500"
                                value={shippingCost}
                                onChange={(e) => setShippingCost(e.target.value)}
                                className="dark:border-slate-600 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Cost Per Order */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Coûts par commande confirmée</h3>
                    <div>
                        <Label className="text-slate-600 dark:text-slate-400">Coût confirmation (DA)</Label>
                        <Input
                            type="number"
                            placeholder="50"
                            value={confirmationCost}
                            onChange={(e) => setConfirmationCost(e.target.value)}
                            className="dark:border-slate-600 dark:text-white"
                        />
                    </div>
                </div>

                {/* Ad Cost */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Coût publicitaire</h3>
                    <div>
                        <Label className="text-slate-600 dark:text-slate-400">Budget pub total (DA)</Label>
                        <Input
                            type="number"
                            placeholder="50000"
                            value={adCost}
                            onChange={(e) => setAdCost(e.target.value)}
                            className="dark:border-slate-600 dark:text-white"
                        />
                    </div>
                </div>

                {/* Additional Costs */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Coûts additionnels</h3>
                    <AnimatePresence>
                        {additionalCosts.map((cost) => (
                            <motion.div
                                key={cost.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex gap-2"
                            >
                                <Input
                                    placeholder="Description (ex: Loyer bureau)"
                                    value={cost.description}
                                    onChange={(e) => updateCost(cost.id, "description", e.target.value)}
                                    className="flex-1 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                />
                                <Input
                                    type="number"
                                    placeholder="Montant"
                                    value={cost.amount}
                                    onChange={(e) => updateCost(cost.id, "amount", e.target.value)}
                                    className="w-32 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                    onClick={() => removeCost(cost.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <Button
                        variant="outline"
                        className="w-full gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        onClick={addCost}
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter un coût
                    </Button>
                </div>

                {/* Results */}
                <motion.div
                    className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border border-indigo-100 dark:border-indigo-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Résultats
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white dark:bg-card rounded-lg shadow-sm">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Commandes effectives</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {results.effectiveOrders.toFixed(0)}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-card rounded-lg shadow-sm">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Revenu total</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {results.revenue.toLocaleString()} DA
                            </p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-card rounded-lg shadow-sm">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Coûts totaux</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                {results.totalCosts.toLocaleString()} DA
                            </p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-card rounded-lg shadow-sm">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Marge</p>
                            <p className={cn(
                                "text-xl font-bold",
                                results.margin >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                                {results.margin.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Profit Net</p>
                        <p className={cn(
                            "text-3xl font-bold",
                            results.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                            {results.profit >= 0 ? "+" : ""}{results.profit.toLocaleString()} DA
                        </p>
                    </div>
                </motion.div>
            </CardContent>
        </Card>
    );
}
