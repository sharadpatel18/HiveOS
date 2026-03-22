"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck } from "lucide-react"

interface Member {
    id: string
    name: string
    email: string
    role: string
}

interface TeamInfoCardProps {
    teamleadId: string
    members: Member[]
    companyId: string
    updatedAt: string
}

function getInitials(name: string): string {
    return name
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0].toUpperCase())
        .slice(0, 2)
        .join("")
}

export function TeamInfoCard({ members, updatedAt }: TeamInfoCardProps) {
    const teamLeads = members.filter((m) => m.role.toUpperCase() === "TEAMLEAD")
    const formattedUpdate = new Date(updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Team Leadership
                </CardTitle>
                <CardDescription>Team leads and last activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {teamLeads.length > 0 ? (
                    <div className="space-y-3">
                        {teamLeads.map((lead) => (
                            <div key={lead.id} className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{lead.name.trim()}</p>
                                    <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                                </div>
                                <Badge variant="default" className="shrink-0">Team Lead</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No team lead assigned yet.</p>
                )}

                <Separator />

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Last updated</span>
                        <span className="font-medium text-right text-xs">{formattedUpdate}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}