"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/core/ui/table";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { MoreHorizontal, Phone, Mail, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/core/ui/dropdown-menu";

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'new' | 'contacted' | 'qualified' | 'client' | 'loyal';
    createdAt: string;
    lastContact?: string;
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
    const getStatusColor = (status: Lead['status']) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'qualified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'client': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'loyal': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: Lead['status']) => {
        switch (status) {
            case 'new': return 'Nouveau';
            case 'contacted': return 'Contacté';
            case 'qualified': return 'Qualifié';
            case 'client': return 'Client';
            case 'loyal': return 'Fidèle';
            default: return status;
        }
    };

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date d&apos;ajout</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                Aucun prospect trouvé.
                            </TableCell>
                        </TableRow>
                    ) : (
                        leads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell className="font-medium">{lead.name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3" /> {lead.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3 w-3" /> {lead.phone}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={getStatusColor(lead.status)}>
                                        {getStatusLabel(lead.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(lead.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Edit className="mr-2 h-4 w-4" /> Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
