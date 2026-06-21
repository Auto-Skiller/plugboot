"use client";

import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/core/layout/PageHeader";
import { Tabs, TabsContent } from "@/components/core/ui/tabs";
import { usePageActions } from "@/components/core/layout/PageActionsContext";

// Import Warehouse View Component
import WarehouseView from "@/views/Operations/Warehouse/page";

export default function WarehousePage() {
    return <WarehouseView />;
}
