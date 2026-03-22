"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Calendar, Building2 } from "lucide-react"

interface TeamHeaderProps {
    name: string
    description: string
    slug: string
    personalTeam: boolean
    createdAt: string
}

export function TeamHeader({ name, description, slug, personalTeam, createdAt }: TeamHeaderProps) {
    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div className="space-y-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
                        <p className="text-sm text-muted-foreground">/{slug}</p>
                    </div>
                </div>
                <Badge variant={personalTeam ? "secondary" : "default"} className="w-fit">
                    {personalTeam ? "Personal Team" : "Organization Team"}
                </Badge>
            </div>

            {description && (
                <p className="text-sm text-muted-foreground max-w-2xl pt-1">{description}</p>
            )}

            <Separator className="mt-3" />

            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Created {formattedDate}
                </span>
                <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    Organization team
                </span>
            </div>
        </div>
    )
}