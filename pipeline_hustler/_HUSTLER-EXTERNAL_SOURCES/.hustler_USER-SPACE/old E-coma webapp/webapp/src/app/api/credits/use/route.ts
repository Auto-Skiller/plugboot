import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
    // Mock response for UI demo
    return NextResponse.json({ success: true, newBalance: 850 })
}
