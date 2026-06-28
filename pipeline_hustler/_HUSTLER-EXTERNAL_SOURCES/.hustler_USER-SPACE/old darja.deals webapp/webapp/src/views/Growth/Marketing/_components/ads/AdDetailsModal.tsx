'use client';

import { X, ExternalLink, ThumbsUp, MessageCircle, Share2, Globe, Calendar, Users, MapPin } from 'lucide-react';

interface AdDetailsModalProps {
    ad: any;
    onClose: () => void;
}

export default function AdDetailsModal({ ad, onClose }: AdDetailsModalProps) {
    if (!ad) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">

                {/* Left: Creative Preview */}
                <div className="w-full md:w-1/2 bg-gray-900 flex items-center justify-center relative min-h-[300px] md:min-h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={ad.thumbnail}
                        alt="Ad Creative Full"
                        className="max-w-full max-h-full object-contain"
                    />
                    {ad.mediaType === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Details & Analytics */}
                <div className="w-full md:w-1/2 flex flex-col h-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-start justify-between sticky top-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {ad.advertiser.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{ad.advertiser}</h2>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">{ad.platform}</span>
                                    <span>•</span>
                                    <span>Active since {ad.created_at}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-8 flex-1">

                        {/* Ad Copy */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ad Copy</h3>
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                                {ad.copy}
                            </p>
                        </div>

                        {/* Performance Stats */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Performance Estimates</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                                    <ThumbsUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                    <div className="text-lg font-bold text-gray-900">{ad.likes.toLocaleString()}</div>
                                    <div className="text-xs text-blue-600/80">Likes</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-center">
                                    <MessageCircle className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                    <div className="text-lg font-bold text-gray-900">{ad.comments.toLocaleString()}</div>
                                    <div className="text-xs text-purple-600/80">Comments</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
                                    <Share2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                    <div className="text-lg font-bold text-gray-900">High</div>
                                    <div className="text-xs text-green-600/80">Virality</div>
                                </div>
                            </div>
                        </div>

                        {/* Targeting Info */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Targeting Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Location:</span>
                                    <span>{ad.targeting.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">Audience:</span>
                                    <span>{ad.targeting.gender}, {ad.targeting.age}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">First Seen:</span>
                                    <span>{ad.created_at}</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-4">
                            <a
                                href={ad.landing_page}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-200"
                            >
                                <span>{ad.cta}</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <p className="text-center text-xs text-gray-400 mt-2">Redirects to {new URL(ad.landing_page).hostname}</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
