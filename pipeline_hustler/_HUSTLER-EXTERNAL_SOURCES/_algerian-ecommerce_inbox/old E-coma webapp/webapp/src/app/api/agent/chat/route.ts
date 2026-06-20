import { NextResponse } from 'next/server'

// Agent Server URL (running on port 3002)
const AGENT_SERVER_URL = process.env.AGENT_SERVER_URL || 'http://localhost:3002'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { message, sessionId, agentOverride } = body

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            )
        }

        console.log(`[API] Proxying chat to Agent Server: ${AGENT_SERVER_URL}`)

        const response = await fetch(`${AGENT_SERVER_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                sessionId,
                agentOverride
            }),
        })

        if (!response.ok) {
            throw new Error(`Agent server responded with ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error('[API] Error communicating with Agent Server:', error)
        return NextResponse.json(
            {
                error: 'Failed to communicate with AI Agent',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 502 }
        )
    }
}
