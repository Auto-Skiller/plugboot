import { NextResponse } from 'next/server'

// TODO: Integrate with real Authentication (Supabase Auth)
// For now, we use a placeholder balance for demo

export async function GET() {
    return NextResponse.json({ balance: 1000 }) // Mock balance for UI demo
}
