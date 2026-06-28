"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/ui/avatar";
import { Package, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
    id: string;
    name: string;
    image?: string;
    sales: number;
    revenue: number;
}

interface TopProductsTableProps {
    products?: Product[];
    limit?: number;
}

const DEFAULT_PRODUCTS: Product[] = [
    { id: "1", name: "Écouteurs Sans Fil Pro", sales: 342, revenue: 1197000 },
    { id: "2", name: "Montre Connectée Sport", sales: 256, revenue: 1024000 },
    { id: "3", name: "Ventilateur Portable", sales: 189, revenue: 378000 },
    { id: "4", name: "Chargeur Rapide 65W", sales: 156, revenue: 234000 },
    { id: "5", name: "Support Téléphone Voiture", sales: 134, revenue: 134000 },
];

export function TopProductsTable({ products = DEFAULT_PRODUCTS, limit }: TopProductsTableProps) {
    const displayProducts = limit ? products.slice(0, limit) : products;
    const maxSales = Math.max(...displayProducts.map((p) => p.sales));

    return (
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Produits Les Plus Vendus
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {displayProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            {/* Rank */}
                            <span
                                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                    : index === 1
                                        ? "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200"
                                        : index === 2
                                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                    }`}
                            >
                                {index + 1}
                            </span>

                            {/* Product Image */}
                            <Avatar className="h-8 w-8 rounded-lg">
                                {product.image ? (
                                    <AvatarImage src={product.image} alt={product.name} />
                                ) : null}
                                <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 rounded-lg">
                                    <Package className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                                    {product.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div
                                        className="h-1 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden flex-1 max-w-24"
                                    >
                                        <motion.div
                                            className="h-full bg-indigo-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(product.sales / maxSales) * 100}%` }}
                                            transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {product.sales} ventes
                                    </span>
                                </div>
                            </div>

                            {/* Revenue */}
                            <div className="text-right">
                                <p className="font-bold text-sm text-slate-900 dark:text-white">
                                    {product.revenue.toLocaleString()} DA
                                </p>
                                <p className="text-[10px] text-green-600 dark:text-green-400 flex items-center justify-end gap-1">
                                    <TrendingUp className="h-2.5 w-2.5" />
                                    +{Math.floor(Math.random() * 20 + 5)}%
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
