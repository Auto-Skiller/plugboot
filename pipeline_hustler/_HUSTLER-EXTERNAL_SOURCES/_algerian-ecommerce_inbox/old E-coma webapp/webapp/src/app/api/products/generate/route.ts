import { NextResponse } from 'next/server'
import { model } from '@/lib/gemini'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
    // Mock response for UI demo
    return NextResponse.json({
        success: true,
        data: {
            name: "Mock Product",
            description: "This is a mock product description.",
            price: 2500,
            category: "Electronics",
            features: ["Feature 1", "Feature 2"]
        }
    })
}
