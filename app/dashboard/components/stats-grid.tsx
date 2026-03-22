// app/dashboard/components/stats-grid.tsx

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, LucideIcon } from "lucide-react"

interface Stat {
    label: string
    value: string
    change: string
    trend: "up" | "neutral"
    icon: LucideIcon
    color: string
    bg: string
}

interface StatsGridProps {
    stats: Stat[]
}

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="relative overflow-hidden">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">{stat.label}</span>
                                <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                                    {stat.change}
                                </span>
                            </div>
                            <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}