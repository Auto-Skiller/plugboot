/**
 * Zone 1: Operations - Confirmation Route
 * Route: /operations/confirmation
 * Imports from: @/views/Operations/ConfirmationCommand
 */

import ConfirmationCommandPage from "@/views/Operations/ConfirmationCommand/page";

export default function ConfirmationRoute() {
    return <ConfirmationCommandPage />;
}

export const metadata = {
    title: "Confirmation Center | E-Coma",
    description: "Zone 1: Operations - Order Confirmation and Risk Management"
};
