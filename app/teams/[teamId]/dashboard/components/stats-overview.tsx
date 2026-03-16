// app/teams/[teamId]/dashboard/_components/stats-overview.tsx
"use client"

import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    Users,
    TrendingUp,
    Timer,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StatsOverviewProps {
    stats: {
        totalTasks: number
        completedTasks: number
        overdueTasks: number
        activeMembers: number
        completionRate: number
        avgTaskTime: string
    }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
    const statCards = [
        {
            label: "Total Tasks",
            value: stats.totalTasks,
            icon: CheckCircle2,
            description: `${stats.completedTasks} completed`,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            label: "Completion Rate",
            value: `${stats.completionRate}%`,
            icon: TrendingUp,
            description: "Last 30 days",
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
            showProgress: true,
            progressValue: stats.completionRate,
        },
        {
            label: "Overdue Tasks",
            value: stats.overdueTasks,
            icon: AlertTriangle,
            description: "Needs attention",
            color: stats.overdueTasks > 0 ? "text-red-600" : "text-green-600",
            bgColor: stats.overdueTasks > 0 ? "bg-red-50 dark:bg-red-950" : "bg-green-50 dark:bg-green-950",
        },
        {
            label: "Active Members",
            value: stats.activeMembers,
            icon: Users,
            description: "Currently online",
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
        },
        {
            label: "In Progress",
            value: stats.totalTasks - stats.completedTasks - stats.overdueTasks,
            icon: Clock,
            description: "Being worked on",
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
        },
        {
            label: "Avg. Completion Time",
            value: stats.avgTaskTime,
            icon: Timer,
            description: "Per task average",
            color: "text-indigo-600",
            bgColor: "bg-indigo-50 dark:bg-indigo-950",
        },
    ]

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {statCards.map((stat) => (
                <Card key={stat.label} className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs font-medium text-muted-foreground">
                                {stat.label}
                            </p>
                        </div>
                        {stat.showProgress && (
                            <Progress value={stat.progressValue} className="mt-2 h-1.5" />
                        )}
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}