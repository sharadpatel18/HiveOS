"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, ShieldCheck, Clock } from "lucide-react"

interface TeamStatsProps {
    totalMembers: number
    teamLeadsCount: number
    createdAt: string
}

export function TeamStats({ totalMembers, teamLeadsCount, createdAt }: TeamStatsProps) {
    const daysSinceCreation = Math.floor(
        (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    const stats = [
        {
            title: "Total Members",
            value: totalMembers,
            description: "Active team members",
            icon: Users,
        },
        {
            title: "Team Leads",
            value: teamLeadsCount,
            description: "Leadership roles assigned",
            icon: ShieldCheck,
        },
        {
            title: "Regular Members",
            value: totalMembers - teamLeadsCount,
            description: "Standard member roles",
            icon: UserCheck,
        },
        {
            title: "Days Active",
            value: daysSinceCreation,
            description: "Since team was created",
            icon: Clock,
        },
    ]

    return (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}