'use client';

import { useState } from 'react';
import { Upload, Palette, Type, Save } from 'lucide-react';

export default function BrandKit() {
    const [brandName, setBrandName] = useState('My Store');
    const [primaryColor, setPrimaryColor] = useState('#3B82F6');
    const [secondaryColor, setSecondaryColor] = useState('#10B981');
    const [font, setFont] = useState('Inter');
    const [logo, setLogo] = useState<string | null>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // Save to local storage or API
        alert('Brand Kit saved successfully!');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Brand Kit</h2>
                    <p className="text-sm text-gray-500">Define your brand identity for AI content generation.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Save className="w-4 h-4" />
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Column: Logo & Name */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                        <input
                            type="text"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={logo} alt="Brand Logo" className="h-20 object-contain mb-2" />
                            ) : (
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                                    <Upload className="w-6 h-6" />
                                </div>
                            )}
                            <p className="text-sm font-medium text-gray-900">Click to upload logo</p>
                            <p className="text-xs text-gray-500">SVG, PNG, JPG (Max 2MB)</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Colors & Typography */}
                <div className="space-y-6">

                    {/* Colors */}
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                            <Palette className="w-4 h-4 text-gray-500" />
                            Brand Colors
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Primary Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Secondary Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Typography */}
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                            <Type className="w-4 h-4 text-gray-500" />
                            Typography
                        </h3>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Primary Font</label>
                            <select
                                value={font}
                                onChange={(e) => setFont(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Inter">Inter (Modern & Clean)</option>
                                <option value="Roboto">Roboto (Neutral)</option>
                                <option value="Playfair Display">Playfair Display (Elegant)</option>
                                <option value="Montserrat">Montserrat (Bold)</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
