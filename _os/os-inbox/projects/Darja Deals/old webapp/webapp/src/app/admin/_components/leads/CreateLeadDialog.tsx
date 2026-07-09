"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";

export function CreateLeadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Créer un prospect</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input id="name" placeholder="Ex: John Doe" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Ex: john@example.com" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" placeholder="Ex: 0555..." />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Statut</Label>
                        <Select defaultValue="new">
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">Nouveau</SelectItem>
                                <SelectItem value="contacted">Contacté</SelectItem>
                                <SelectItem value="qualified">Qualifié</SelectItem>
                                <SelectItem value="client">Client</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Créer le prospect</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
