
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { BarChart } from "lucide-react";

export default function SocialAnalytics() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-green-500" />
                    Social Analytics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center p-6 text-muted-foreground border-2 border-dashed rounded-lg">
                    Social Analytics Component Placeholder
                </div>
            </CardContent>
        </Card>
    );
}
