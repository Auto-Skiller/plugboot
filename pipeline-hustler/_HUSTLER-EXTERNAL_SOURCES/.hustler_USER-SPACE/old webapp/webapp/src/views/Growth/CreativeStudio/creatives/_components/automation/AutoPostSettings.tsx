
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Clock } from "lucide-react";

export default function AutoPostSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Auto Post Settings
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center p-6 text-muted-foreground border-2 border-dashed rounded-lg">
                    Auto Post Settings Component Placeholder
                </div>
            </CardContent>
        </Card>
    );
}
