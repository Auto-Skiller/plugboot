
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Megaphone } from "lucide-react";

export default function Campaigns() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-blue-500" />
                    Campaigns
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center p-6 text-muted-foreground border-2 border-dashed rounded-lg">
                    Campaigns Component Placeholder
                </div>
            </CardContent>
        </Card>
    );
}
