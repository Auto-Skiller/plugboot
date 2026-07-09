import React, { useState } from 'react';
import { Phone, Copy, Check } from 'lucide-react';

type ScriptCategory = 'greeting' | 'confirmation' | 'objection' | 'closing' | 'upsell' | 'return_prevention';

const scripts = {
    darja: {
        greeting: { title: 'Greeting', content: "Salam [Name], m3ak [StoreName]. Rani n3aytlek 3la jal la commande ta3ek dyal [Product]. Esk hada weqt mlayeh nahdar m3ak?" },
        confirmation: { title: 'Order Confirmation', content: "Sahit. Habit berk nconfirmé l'adresse: [Address]. Le prix total houwa [Price] DA avec livraison. Hna rayhin nbatouhalek ghodwa nchallah." },
        objection: { title: 'Price Objection', content: "Fhemtek. Besah le produit hada original w fih garantie, machi kima li ybi3ouh f'marché copies. W zid 3andek l'échange gratuit ida kan kach mochkil." },
        closing: { title: 'Closing', content: "Ya3tik saha [Name]. Tawslek SMS ki ykoun livreur qrib. Nharak mabrouk!" },
        upsell: { title: 'Upsell', content: "3la fkra, bzaf li chraw hada zadou m3ah [Accessory] ghir b' [Price] DA. Nzidlak wahed f'la boite?" },
        return_prevention: { title: 'Return Prevention', content: "Juste pour rappel, le livreur y3ayetlek. Ida ma reponditich 3lik, rahou y3awad ywali. Svp kounou majoudin bash ma tloupech la commande." }
    },
    french: {
        greeting: { title: 'Greeting', content: "Bonjour [Name], c'est [StoreName]. Je vous appelle concernant votre commande de [Product]. Est-ce un bon moment?" },
        confirmation: { title: 'Order Confirmation', content: "D'accord. Je voulais juste confirmer l'adresse : [Address]. Le prix total est de [Price] DA avec livraison. Nous l'expédierons demain inshallah." },
        objection: { title: 'Price Objection', content: "Je comprends. Mais ce produit est original avec garantie, pas comme les copies du marché. De plus, vous avez l'échange gratuit en cas de problème." },
        closing: { title: 'Closing', content: "Merci [Name]. Vous recevrez un SMS quand le livreur sera proche. Bonne journée !" },
        upsell: { title: 'Upsell', content: "Au fait, beaucoup achètent aussi [Accessory] pour seulement [Price] DA de plus. Je l'ajoute à la boîte ?" },
        return_prevention: { title: 'Return Prevention', content: "Juste un rappel, le livreur vous appellera. Si vous ne répondez pas, il repartira. Soyez disponible pour ne pas rater la commande SVP." }
    }
};

export const CallCenterScripts = () => {
    const [activeTab, setActiveTab] = useState<ScriptCategory>('greeting');
    const [language, setLanguage] = useState<'darja' | 'french'>('darja');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(scripts[language][activeTab].content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-[hsl(var(--accent-blue))]">
                    <Phone className="w-5 h-5" />
                    Call Center Scripts
                </h3>
                <div className="flex bg-muted rounded-lg p-1">
                    <button
                        onClick={() => setLanguage('darja')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'darja' ? 'bg-card shadow text-[hsl(var(--accent-blue))]' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Darja
                    </button>
                    <button
                        onClick={() => setLanguage('french')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'french' ? 'bg-card shadow text-[hsl(var(--accent-blue))]' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Français
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {(Object.keys(scripts[language]) as ScriptCategory[]).map((key) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === key
                            ? 'bg-[hsl(var(--accent-blue))] text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        {scripts[language][key].title}
                    </button>
                ))}
            </div>

            <div className="flex-1 bg-muted p-4 rounded-md border border-border relative group">
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {scripts[language][activeTab].content}
                </p>
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 bg-card rounded-md shadow-sm border border-border text-muted-foreground hover:text-[hsl(var(--accent-blue))] transition-colors"
                    title="Copy to clipboard"
                >
                    {copied ? <Check className="w-4 h-4 text-[hsl(var(--accent-green))]" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground text-center">
                Pro Tip: Smile while talking, it changes your voice tone!
            </div>
        </div>
    );
};
