import { NextResponse } from 'next/server'
import { model } from '@/lib/gemini'

export async function POST(request: Request) {
    // Mock response for UI demo
    return NextResponse.json({
        success: true,
        analysis: {
            score: 9,
            intent: "High Purchase Intent",
            suggested_reply_darija: "Salam, kayen stock. Prix 2500 DA."
        }
    })
}
