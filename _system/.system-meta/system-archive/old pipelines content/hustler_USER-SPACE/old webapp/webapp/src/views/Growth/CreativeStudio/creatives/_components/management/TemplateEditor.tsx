
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Layout } from "lucide-react";

export default function TemplateEditor() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-purple-500" />
                    Template Editor
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center p-6 text-muted-foreground border-2 border-dashed rounded-lg">
                    Template Editor Component Placeholder
                </div>
            </CardContent>
        </Card>
    );
}
