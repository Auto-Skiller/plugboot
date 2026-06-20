
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Share2 } from "lucide-react";

export default function SocialChannelsGrid() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-blue-500" />
                    Social Channels
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center p-6 text-muted-foreground border-2 border-dashed rounded-lg">
                    Social Channels Grid Component Placeholder
                </div>
            </CardContent>
        </Card>
    );
}
