// app/dashboard/components/welcome-section.tsx

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface WelcomeSectionProps {
    userName: string
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Good morning, {userName} 👋
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Here's what's happening at your company today.
                </p>
            </div>
            <Button size="sm" className="gap-2 hidden sm:flex">
                <Plus className="h-4 w-4" />
                Quick Action
            </Button>
        </div>
    )
}