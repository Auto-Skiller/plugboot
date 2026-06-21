'use client'

import { useEffect, useState } from 'react'
import { Gem } from 'lucide-react'

export function CreditBalance() {
    const [balance, setBalance] = useState<number | null>(null)

    useEffect(() => {
        // Poll for balance every 30 seconds or just fetch once
        const fetchBalance = () => {
            fetch('/api/credits/balance')
                .then(res => res.json())
                .then(data => setBalance(data.balance))
                .catch(err => console.error(err))
        }

        fetchBalance()
    }, [])

    if (balance === null) return <div className="animate-pulse h-8 w-24 bg-gray-200 rounded-full" />

    return (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
            <Gem className="w-4 h-4" />
            <span className="font-bold text-sm">{balance.toLocaleString()} Credits</span>
        </div>
    )
}
