import React, { useState } from 'react';
import { MapPin, MessageSquare, ExternalLink, RefreshCw } from 'lucide-react';

export const LocationCollector = () => {
    const [chatTranscript, setChatTranscript] = useState('');
    const [detectedLocation, setDetectedLocation] = useState<{
        lat?: number;
        lng?: number;
        source?: string;
        link?: string;
    } | null>(null);

    // Fallback UI states
    const [wilaya, setWilaya] = useState('');
    const [commune, setCommune] = useState('');
    const [landmark, setLandmark] = useState('');

    const parseLocation = () => {
        // 1. Google Maps Links
        const mapsLinkRegex = /(https?:\/\/(?:www\.|maps\.)?google\.com\/maps\S*)|(https?:\/\/maps\.app\.goo\.gl\/\S+)/g;
        const linkMatch = chatTranscript.match(mapsLinkRegex);

        if (linkMatch) {
            setDetectedLocation({
                source: 'Google Maps Link',
                link: linkMatch[0]
            });
            return;
        }

        // 2. GPS Coordinates (Simple parsing for lat, lng)
        // Matches "36.7525, 3.0512" or similar
        const gpsRegex = /(\d{1,2}\.\d+),\s*(\d{1,2}\.\d+)/;
        const gpsMatch = chatTranscript.match(gpsRegex);

        if (gpsMatch) {
            setDetectedLocation({
                lat: parseFloat(gpsMatch[1]),
                lng: parseFloat(gpsMatch[2]),
                source: 'Coordinates'
            });
            return;
        }

        setDetectedLocation(null);
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[hsl(var(--accent-blue))]">
                <MapPin className="w-5 h-5" />
                Location Collector (Chat Intelligence)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Paste Chat Transcript
                    </label>
                    <textarea
                        className="w-full h-32 p-3 border rounded-md text-sm focus:ring-2 focus:ring-[hsl(var(--accent-blue))] outline-none resize-none bg-[hsl(var(--accent-blue))]/5"
                        placeholder="Customer: Hello, I want to order. My address is... https://maps.app.goo.gl/..."
                        value={chatTranscript}
                        onChange={(e) => setChatTranscript(e.target.value)}
                    />
                    <button
                        onClick={parseLocation}
                        className="mt-2 text-sm bg-[hsl(var(--accent-blue))]/10 text-[hsl(var(--accent-blue))] px-3 py-1.5 rounded-md hover:bg-[hsl(var(--accent-blue))]/20 transition flex items-center gap-1"
                    >
                        <RefreshCw className="w-3 h-3" /> Extract Location
                    </button>
                </div>

                <div className="space-y-4 border-l pl-6 border-border">
                    {detectedLocation ? (
                        <div className="bg-[hsl(var(--accent-green))]/10 p-4 rounded-md border border-[hsl(var(--accent-green))]/20">
                            <div className="text-sm font-semibold text-[hsl(var(--accent-green))] mb-1 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Location Found!
                            </div>
                            <div className="text-xs text-[hsl(var(--accent-green))] mb-2">Source: {detectedLocation.source}</div>

                            {detectedLocation.link && (
                                <a
                                    href={detectedLocation.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-[hsl(var(--accent-blue))] underline flex items-center gap-1 hover:text-[hsl(var(--accent-blue))]"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Open in Maps
                                </a>
                            )}

                            {detectedLocation.lat && (
                                <div className="font-mono text-xs text-foreground mb-2">
                                    {detectedLocation.lat}, {detectedLocation.lng}
                                </div>
                            )}

                            <button
                                onClick={() => alert("GPS Coordinates saved to Order #ORD-123")}
                                className="w-full mt-2 bg-[hsl(var(--accent-green))] text-white text-xs py-1.5 rounded hover:bg-[hsl(var(--accent-green))]/90 transition"
                            >
                                Attach to Order
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground italic p-4 bg-muted rounded-md text-center">
                            No GPS data detected in chat.
                        </div>
                    )}

                    <div className="border-t pt-4 mt-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fallbacks</h4>

                        {/* SMS Deeplink Fallback */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Request Location via SMS</label>
                            <a
                                href="sms:?body=Salam, marhba bik 3andna. Ta3ich ab3atlna la position ta3ek bash nlivlriwlek la commande. Merci!"
                                className="w-full bg-[hsl(var(--accent-green))]/10 text-[hsl(var(--accent-green))] border border-[hsl(var(--accent-green))]/20 py-2 rounded-md text-sm font-medium hover:bg-[hsl(var(--accent-green))]/20 transition flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Send SMS Request
                            </a>
                        </div>

                        <h5 className="text-xs font-medium text-muted-foreground mb-2">Manual Entry</h5>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Wilaya"
                                value={wilaya}
                                onChange={(e) => setWilaya(e.target.value)}
                                className="p-2 border border-border rounded-md text-sm outline-none focus:border-[hsl(var(--accent-blue))] bg-background text-foreground"
                            />
                            <input
                                type="text"
                                placeholder="Commune"
                                value={commune}
                                onChange={(e) => setCommune(e.target.value)}
                                className="p-2 border border-border rounded-md text-sm outline-none focus:border-[hsl(var(--accent-blue))] bg-background text-foreground"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Landmark (e.g., Near the mosque)"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            className="w-full p-2 border border-border rounded-md text-sm outline-none focus:border-[hsl(var(--accent-blue))] bg-background text-foreground"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
