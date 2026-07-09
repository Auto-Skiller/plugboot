import { NextResponse } from 'next/server'
import { model } from '@/lib/gemini'

export async function POST(request: Request) {
    // Mock response for UI demo
    return NextResponse.json({
        success: true,
        analysis: {
            action: "KEEP",
            reason: "Positive feedback",
            sentiment_score: 0.9
        }
    })
}
