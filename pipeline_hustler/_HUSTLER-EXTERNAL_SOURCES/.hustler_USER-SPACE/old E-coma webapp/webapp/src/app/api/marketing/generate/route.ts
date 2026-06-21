import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // Mock response for UI demo
    return NextResponse.json({
        success: true,
        content: {
            variations: [
                {
                    hook: "Hook 1",
                    body: "Body 1",
                    cta: "CTA 1",
                    image_idea: "Image Idea 1"
                }
            ]
        }
    })
}
