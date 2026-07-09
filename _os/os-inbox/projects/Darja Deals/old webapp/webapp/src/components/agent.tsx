"use client"
import { useAgent } from '@/hooks/use-agent'
import { useState } from 'react'

export function AgentChat() {
    const { messages, input, setInput, sendMessage, loading } = useAgent()

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    🤖 E-coma Agent
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Online
                    </span>
                </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm">
                        <p>How can I help you build E-coma today?</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-2">
                            <span className="animate-pulse">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about inventory, code, or planning..."
                        className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    )
}
