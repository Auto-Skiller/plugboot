import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // Mock response for UI demo
    return NextResponse.json({ action: 'maintain', reason: 'ROAS is healthy' })
}
