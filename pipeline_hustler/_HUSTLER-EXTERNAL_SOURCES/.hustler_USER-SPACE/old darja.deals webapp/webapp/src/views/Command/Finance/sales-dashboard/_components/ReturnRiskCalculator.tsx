import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

export const ReturnRiskCalculator = () => {
    const [phone, setPhone] = useState('');
    const [wilaya, setWilaya] = useState('');
    const [orderValue, setOrderValue] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [riskScore, setRiskScore] = useState<number | null>(null);

    const calculateRisk = () => {
        // Mock logic for now
        let score = 0;
        if (wilaya.toLowerCase() === 'adrar') score += 20;
        if (parseInt(orderValue) > 10000) score += 30;
        if (phone.startsWith('05')) score += 10;
        if (productCategory === 'electronics') score += 15; // Higher risk for electronics
        if (productCategory === 'fashion') score += 25; // High return rate for fashion

        // Random element for demo
        score += Math.floor(Math.random() * 40);
        const finalScore = Math.min(score, 100);

        setRiskScore(finalScore);

        // Mock: Store historical data in Supabase for training (Plan Item 1 Note)
        console.log("Saving to Supabase 'risk_logs':", {
            phone, wilaya, orderValue, category: productCategory, score: finalScore, timestamp: new Date()
        });
    };

    const getRiskColor = (score: number) => {
        if (score < 30) return 'text-[hsl(var(--accent-green))]';
        if (score < 70) return 'text-[hsl(var(--accent-orange))]';
        return 'text-destructive';
    };

    const getRiskLabel = (score: number) => {
        if (score < 30) return 'Low Risk';
        if (score < 70) return 'Medium Risk';
        return 'High Risk';
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShieldQuestion className="w-5 h-5 text-[hsl(var(--accent-blue))]" />
                Return Risk Calculator
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-[hsl(var(--accent-blue))] outline-none bg-background text-foreground"
                        placeholder="0555..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Wilaya</label>
                    <input
                        type="text"
                        value={wilaya}
                        onChange={(e) => setWilaya(e.target.value)}
                        className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-[hsl(var(--accent-blue))] outline-none bg-background text-foreground"
                        placeholder="Algiers..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Order Value (DA)</label>
                    <input
                        type="number"
                        value={orderValue}
                        onChange={(e) => setOrderValue(e.target.value)}
                        className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-[hsl(var(--accent-blue))] outline-none bg-background text-foreground"
                        placeholder="5000"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Product Category</label>
                    <select
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        className="w-full p-2 border border-border rounded-md focus:ring-2 focus:ring-[hsl(var(--accent-blue))] outline-none bg-card text-foreground"
                    >
                        <option value="">Select category...</option>
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                        <option value="home">Home & Kitchen</option>
                        <option value="beauty">Beauty</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <button
                    onClick={calculateRisk}
                    className="w-full bg-[hsl(var(--accent-blue))] text-white py-2 rounded-md hover:bg-[hsl(var(--accent-blue))]/90 transition"
                >
                    Calculate Risk
                </button>

                {riskScore !== null && (
                    <div className="mt-6 p-4 bg-muted rounded-md text-center">
                        <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Risk Score</div>
                        <div className={`text-3xl font-bold ${getRiskColor(riskScore)}`}>
                            {riskScore}/100
                        </div>
                        <div className={`text-sm font-medium ${getRiskColor(riskScore)}`}>
                            {getRiskLabel(riskScore)}
                        </div>
                        {/* Action Recommendation */}
                        {riskScore >= 70 && (
                            <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive font-medium flex items-center justify-center gap-2">
                                <ShieldAlert className="w-4 h-4" />
                                Action: Require Prepayment (CCP/Baridimob)
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
