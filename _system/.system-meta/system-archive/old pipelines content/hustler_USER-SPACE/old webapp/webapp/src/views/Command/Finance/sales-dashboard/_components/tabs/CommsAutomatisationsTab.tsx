"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Bot,
    MessageSquare,
    Phone,
    Mail,
    Clock,
    Settings,
    Zap,
    CheckCircle2,
    Send,
    MapPin
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { Switch } from "@/components/core/ui/switch";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";
import { ConfirmationBot } from "@/views/Growth/Marketing/_components/ConfirmationBot";

// SMS Templates
const smsTemplates = [
    { id: 1, name: "Confirmation", message: "Bonjour {nom}, votre commande #{id} est confirmée. Livraison prévue sous 2-3 jours.", status: "active" },
    { id: 2, name: "Expédition", message: "{nom}, votre colis #{id} est en route! Suivez: {lien}", status: "active" },
    { id: 3, name: "Livraison", message: "Votre commande #{id} sera livrée aujourd'hui. Préparez {montant} DA.", status: "active" },
    { id: 4, name: "Retour", message: "Commande #{id} retournée. Motif: {motif}. Contactez-nous pour assistance.", status: "inactive" },
];

// Bot stats
const botStats = {
    confirmationsToday: 42,
    gpsCollected: 28,
    autoReplies: 156,
    avgResponseTime: "12s",
};

// Communication log
const communicationLog = [
    { id: 1, customer: "Amine K.", type: "sms", message: "Confirmation envoyée", time: "Il y a 5 min", status: "delivered" },
    { id: 2, customer: "Sarah B.", type: "whatsapp", message: "GPS collecté", time: "Il y a 12 min", status: "delivered" },
    { id: 3, customer: "Karim S.", type: "call", message: "Appel - 2min 34s", time: "Il y a 25 min", status: "completed" },
    { id: 4, customer: "Mounir L.", type: "sms", message: "Livraison confirmée", time: "Il y a 1h", status: "delivered" },
];

export function CommsAutomatisationsTab() {
    const [botEnabled, setBotEnabled] = useState(true);
    const [gpsBot, setGpsBot] = useState(true);

    return (
        <div className="space-y-6">
            {/* Bot Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Bot className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-muted-foreground">Confirmations Bot</span>
                        </div>
                        <p className="text-2xl font-bold">{botStats.confirmationsToday}</p>
                        <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            <span className="text-sm text-muted-foreground">GPS Collectés</span>
                        </div>
                        <p className="text-2xl font-bold">{botStats.gpsCollected}</p>
                        <p className="text-xs text-muted-foreground">Via WhatsApp</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            <span className="text-sm text-muted-foreground">Réponses Auto</span>
                        </div>
                        <p className="text-2xl font-bold">{botStats.autoReplies}</p>
                        <p className="text-xs text-muted-foreground">Cette semaine</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-5 w-5 text-orange-500" />
                            <span className="text-sm text-muted-foreground">Temps Réponse</span>
                        </div>
                        <p className="text-2xl font-bold">{botStats.avgResponseTime}</p>
                        <p className="text-xs text-muted-foreground">Moyenne</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bots Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* WhatsApp Confirmation Bot */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-green-500" />
                                Bot Confirmation WhatsApp
                            </CardTitle>
                            <Switch checked={botEnabled} onCheckedChange={setBotEnabled} />
                        </div>
                        <CardDescription>
                            Confirme automatiquement les commandes via WhatsApp
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                            <p className="text-sm font-medium">Message de confirmation :</p>
                            <p className="text-sm text-muted-foreground italic">
                                "Bonjour! Votre commande #{"{id}"} de {"{montant}"} DA est en cours de traitement.
                                Confirmez-vous cette commande? Répondez OUI ou NON."
                            </p>
                        </div>
                        <Button variant="outline" className="w-full gap-2">
                            <Settings className="h-4 w-4" />
                            Configurer le Bot
                        </Button>
                    </CardContent>
                </Card>

                {/* GPS Request Bot */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-500" />
                                Bot Collecte GPS
                            </CardTitle>
                            <Switch checked={gpsBot} onCheckedChange={setGpsBot} />
                        </div>
                        <CardDescription>
                            Demande automatiquement la localisation GPS via WhatsApp
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                            <p className="text-sm font-medium">Message GPS :</p>
                            <p className="text-sm text-muted-foreground italic">
                                "Pour faciliter la livraison, merci de partager votre position GPS.
                                Cliquez sur 📎 → Position → Envoyer la position actuelle."
                            </p>
                        </div>
                        <Button variant="outline" className="w-full gap-2">
                            <Settings className="h-4 w-4" />
                            Configurer le Bot
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* SMS Templates */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-[hsl(var(--accent-orange))]" />
                        Modèles SMS
                    </CardTitle>
                    <CardDescription>Templates pour envoi automatique de SMS</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {smsTemplates.map((template) => (
                            <div key={template.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium">{template.name}</p>
                                        <Badge variant={template.status === "active" ? "default" : "secondary"}>
                                            {template.status === "active" ? "Actif" : "Inactif"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{template.message}</p>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Communication Log */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                        Historique Communications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {communicationLog.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    {log.type === "sms" && <Send className="h-4 w-4 text-orange-500" />}
                                    {log.type === "whatsapp" && <MessageSquare className="h-4 w-4 text-green-500" />}
                                    {log.type === "call" && <Phone className="h-4 w-4 text-blue-500" />}
                                    <div>
                                        <p className="font-medium">{log.customer}</p>
                                        <p className="text-sm text-muted-foreground">{log.message}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="gap-1 mb-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        {log.status === "delivered" ? "Envoyé" : "Terminé"}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground">{log.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Call Recording - Coming Soon */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/95 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Badge variant="secondary" className="gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        Bientôt Disponible
                    </Badge>
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
                        Enregistrement des Appels
                    </CardTitle>
                    <CardDescription>Enregistrez et réécoutez les appels de confirmation</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Fonctionnalité d'enregistrement automatique des appels pour améliorer la qualité du service.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
