// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center space-y-8">

                {/* Status badge */}
                <div className="flex justify-center">
                    <Badge variant="outline" className="text-xs tracking-widest uppercase px-4 py-1 text-muted-foreground">
                        Error 404
                    </Badge>
                </div>

                {/* Heading */}
                <div className="space-y-3">
                    <h1 className="text-8xl font-bold tracking-tighter text-foreground">
                        404
                    </h1>
                    <h2 className="text-xl font-semibold text-foreground">
                        Page not found
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button asChild>
                        <Link href="/">Go home</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/contact">Contact support</Link>
                    </Button>
                </div>

            </div>
        </div>
    );
}