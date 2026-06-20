"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Textarea } from "@/components/core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";

export function ProductFormContent({ onCancel, onSave }: { onCancel?: () => void; onSave?: () => void }) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nom</Label>
                <Input id="name" className="col-span-3" placeholder="Ex: Wireless Earbuds" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sku" className="text-right">SKU</Label>
                <Input id="sku" className="col-span-3" placeholder="Ex: WE-001" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Catégorie</Label>
                <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="electronics">Électronique</SelectItem>
                        <SelectItem value="clothing">Vêtements</SelectItem>
                        <SelectItem value="home">Maison</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Prix (DA)</Label>
                <Input id="price" type="number" className="col-span-3" placeholder="0.00" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">Stock Initial</Label>
                <Input id="stock" type="number" className="col-span-3" placeholder="0" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" className="col-span-3" placeholder="Description du produit..." />
            </div>

            <div className="flex justify-end gap-2 mt-4">
                {onCancel && <Button variant="outline" onClick={onCancel}>Annuler</Button>}
                <Button onClick={onSave}>Enregistrer</Button>
            </div>
        </div>
    );
}

export function ProductForm({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un produit</DialogTitle>
                </DialogHeader>
                <ProductFormContent onCancel={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    );
}
