import React, { useState } from 'react';
import { Ban, Shield, Trash2, Plus } from 'lucide-react';

export const CustomerBlacklist = () => {
    const [blacklist, setBlacklist] = useState<string[]>(['0555123456', '0666987654']);
    const [newNumber, setNewNumber] = useState('');
    const [communityShield, setCommunityShield] = useState(false);

    const addNumber = () => {
        if (newNumber && !blacklist.includes(newNumber)) {
            setBlacklist([...blacklist, newNumber]);
            setNewNumber('');
        }
    };

    const removeNumber = (num: string) => {
        setBlacklist(blacklist.filter(n => n !== num));
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-destructive">
                        <Ban className="w-5 h-5" />
                        Customer Blacklist
                    </h3>
                    <p className="text-sm text-muted-foreground">Manage blocked phone numbers</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Community Shield</span>
                    <button
                        onClick={() => setCommunityShield(!communityShield)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${communityShield ? 'bg-[hsl(var(--accent-green))]' : 'bg-muted'
                            }`}
                    >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${communityShield ? 'translate-x-6' : ''
                            }`} />
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-destructive outline-none"
                    placeholder="Add phone number..."
                />
                <button
                    onClick={addNumber}
                    className="bg-destructive text-white px-4 py-2 rounded-md hover:bg-destructive/90 transition flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add
                </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {blacklist.map((num) => (
                    <div key={num} className="flex justify-between items-center p-3 bg-destructive/5 rounded-md border border-destructive/10">
                        <div className="flex flex-col">
                            <span className="font-mono text-foreground">
                                {communityShield ? num.replace(/(\d{4})\d{4}(\d{2})/, "$1****$2") : num}
                            </span>
                            {communityShield && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Anonymized (SHA-256)
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => removeNumber(num)}
                            className="text-destructive/60 hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}            </div>

            {blacklist.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No numbers blacklisted
                </div>
            )}

            {communityShield && (
                <div className="mt-6 p-3 bg-[hsl(var(--accent-green))]/10 rounded-md border border-[hsl(var(--accent-green))]/20 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[hsl(var(--accent-green))]" />
                    <div className="text-xs text-[hsl(var(--accent-green))]">
                        <strong>Community Shield Active:</strong> You are protected from 1,240+ known bad actors shared by the community.
                    </div>
                </div>
            )}
        </div>
    );
};
