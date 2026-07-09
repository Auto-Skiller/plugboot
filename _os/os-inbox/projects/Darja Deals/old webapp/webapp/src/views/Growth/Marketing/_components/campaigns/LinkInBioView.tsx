'use client';

import { useState } from 'react';
import { Link as LinkIcon, Plus, Image as ImageIcon, Layout, Eye, Share2, Smartphone } from 'lucide-react';
import { Button } from '@/components/core/ui/button';
import { Card, CardContent } from '@/components/core/ui/card';

export default function LinkInBioPage() {
    const [links, setLinks] = useState([
        { id: 1, title: 'Shop New Arrivals', url: 'https://riglify.com/new', active: true },
        { id: 2, title: 'Read our Blog', url: 'https://riglify.com/blog', active: true },
        { id: 3, title: 'Summer Sale - 50% Off', url: 'https://riglify.com/sale', active: true },
    ]);

    return (
        <div className="h-[calc(100vh-4rem)] flex bg-gray-50">

            {/* Left Column: Editor */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-8">

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <LinkIcon className="w-8 h-8 text-pink-600" />
                                Link in Bio
                            </h1>
                            <p className="text-gray-600">Design your mini-landing page for Instagram & TikTok.</p>
                        </div>
                        <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                            <Share2 className="w-4 h-4 mr-2" /> Publish
                        </Button>
                    </div>

                    {/* Profile Section */}
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-bold text-gray-900">Profile</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-pink-500 transition-colors">
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Display Name (e.g. Riglify Store)" defaultValue="Riglify Store" />
                                    <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" rows={2} placeholder="Bio description..." defaultValue="The best e-commerce tools for growth. 🚀" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Links Section */}
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Links</h3>
                                <Button size="sm" variant="outline" className="text-pink-600 border-pink-200 hover:bg-pink-50">
                                    <Plus className="w-4 h-4 mr-2" /> Add Link
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {links.map((link) => (
                                    <div key={link.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move group">
                                        <div className="text-gray-300 cursor-grab"><Layout className="w-4 h-4" /></div>
                                        <div className="flex-1 space-y-1">
                                            <input type="text" className="w-full bg-transparent font-medium text-gray-900 focus:outline-none" defaultValue={link.title} />
                                            <input type="text" className="w-full bg-transparent text-xs text-gray-500 focus:outline-none" defaultValue={link.url} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${link.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${link.active ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance */}
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-bold text-gray-900">Appearance</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {['bg-white', 'bg-black', 'bg-gradient-to-br from-pink-500 to-orange-400', 'bg-blue-900'].map((bg, i) => (
                                    <div key={i} className={`aspect-[9/16] rounded-lg border-2 cursor-pointer ${bg} ${i === 0 ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200'}`}></div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="w-[400px] bg-gray-100 border-l border-gray-200 flex items-center justify-center p-8 sticky top-0 h-full">
                <div className="w-[300px] h-[600px] bg-black rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden relative">
                    {/* Phone Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>

                    {/* Screen Content */}
                    <div className="w-full h-full bg-white overflow-y-auto pt-12 px-6 pb-6 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gray-200 mb-4 shrink-0"></div>
                        <h2 className="font-bold text-lg text-gray-900 mb-1">Riglify Store</h2>
                        <p className="text-sm text-gray-500 text-center mb-6">The best e-commerce tools for growth. 🚀</p>

                        <div className="w-full space-y-3">
                            {links.filter(l => l.active).map((link) => (
                                <div key={link.id} className="w-full p-3 bg-white border border-gray-200 rounded-lg text-center shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                                    <span className="font-medium text-gray-900 text-sm">{link.title}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-8">
                            <div className="flex gap-4 text-gray-400">
                                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
