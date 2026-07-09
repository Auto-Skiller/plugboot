import { useState, useRef, useCallback } from 'react'

export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}

export function useAgent() {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState('')

    const sendMessage = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const response = await fetch('http://localhost:3002/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content })
            })

            if (!response.ok) throw new Error('Failed to fetch')

            const assistantMsgId = (Date.now() + 1).toString()
            // Add placeholder for assistant
            setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }])

            // Handle Stream
            if (response.body) {
                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let accumulated = ''

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })
                    // Basic parsing for AI SDK stream format (text-delta logic is complex, 
                    // but for simple text stream it might just be the text)
                    // The AI SDK stream protocol is specific.
                    // If we use standard .toDataStreamResponse(), it sends:
                    // 0:"text_part"
                    // We need to parse this if we want full fidelity.
                    // For now, let's assume it might return raw text or simply append chunks.
                    // Actually, streamText returns a specific protocol.
                    // We might need a mini-parser or just display raw chunk for debugging first.

                    // Simple hack: Regex to extract text content if it follows "0:..." format
                    // OR just accumulate.

                    accumulated += chunk
                    // Update the last message
                    setMessages(prev => {
                        const rest = prev.slice(0, -1)
                        return [...rest, { id: assistantMsgId, role: 'assistant', content: accumulated }]
                    })
                }
            }

        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Error: Failed to connect to agent.' }])
        } finally {
            setLoading(false)
        }
    }, [input])

    return {
        messages,
        input,
        setInput,
        sendMessage,
        loading
    }
}
