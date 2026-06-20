import React, { useState } from 'react';
import { UploadCloud, Download, CheckCircle, AlertCircle } from 'lucide-react';

export const OfflineConversionSync = () => {
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');

    const handleExport = () => {
        // Mock export
        setTimeout(() => {
            // Simulating download logic
            alert("Downloading 'paid_orders_fb_format.csv'...");
        }, 500);
    };

    const handleSync = () => {
        setSyncStatus('syncing');
        setTimeout(() => {
            setSyncStatus('success');
        }, 2000);
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border h-full">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-[hsl(var(--accent-blue))]">
                <UploadCloud className="w-5 h-5" />
                Offline Conversions (Meta/TikTok)
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
                Sync delivered & paid orders back to ad platforms to optimize targeting.
            </p>

            <div className="space-y-4">
                <div className="p-4 bg-[hsl(var(--accent-blue))]/5 rounded-lg border border-[hsl(var(--accent-blue))]/20">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[hsl(var(--accent-blue))]">Unsynced Paid Orders</span>
                        <span className="text-xl font-bold text-[hsl(var(--accent-blue))]">42</span>
                    </div>
                    <button
                        onClick={handleExport}
                        className="w-full bg-white border border-[hsl(var(--accent-blue))]/30 text-[hsl(var(--accent-blue))] py-2 rounded-md text-sm font-medium hover:bg-[hsl(var(--accent-blue))]/10 transition flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Download CSV for Meta API
                    </button>
                </div>

                <div className="border-t pt-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Direct API Sync (Beta)</h4>
                    {syncStatus === 'success' ? (
                        <div className="p-3 bg-[hsl(var(--accent-green))]/10 text-[hsl(var(--accent-green))] rounded-md text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Sync Complete! 42 Events sent.
                        </div>
                    ) : (
                        <button
                            onClick={handleSync}
                            disabled={syncStatus === 'syncing'}
                            className="w-full bg-[hsl(var(--accent-blue))] text-white py-2 rounded-md text-sm font-medium hover:bg-[hsl(var(--accent-blue))]/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {syncStatus === 'syncing' ? 'Sending Events...' : 'Sync to Meta Pixel Now'}
                        </button>
                    )}
                </div>

                <div className="flex gap-2 items-start text-xs text-muted-foreground mt-2">
                    <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>Matching requires: Phone, Email, or City. Success rate is usually ~60% for COD.</span>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                    <h5 className="text-xs font-semibold text-foreground mb-2">Instructions (Manual Upload)</h5>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal ml-4">
                        <li>Download the CSV above.</li>
                        <li>Go to <strong>Meta Events Manager</strong> {'>'} Data Sources.</li>
                        <li>Select &quot;Offline Events&quot; {'>'} Upload Events.</li>
                        <li>Drag & drop the CSV file and map the columns (Phone, Value, Currency).</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};
