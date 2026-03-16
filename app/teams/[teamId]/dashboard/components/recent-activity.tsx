// app/teams/[teamId]/dashboard/_components/recent-activity.tsx
"use client"

import {
    CheckCircle,
    GitPullRequest,
    MessageSquare,
    UserPlus,
    Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity as ActivityType } from "./team-dashboard"

interface RecentActivityProps {
    activities: ActivityType[]
    compact?: boolean
}

const ACTIVITY_ICONS = {
    task: CheckCircle,
    member: UserPlus,
    team: GitPullRequest,
    comment: MessageSquare,
}

const ACTIVITY_COLORS = {
    task: "text-blue-500 bg-blue-50 dark:bg-blue-950",
    member: "text-green-500 bg-green-50 dark:bg-green-950",
    team: "text-purple-500 bg-purple-50 dark:bg-purple-950",
    comment: "text-orange-500 bg-orange-50 dark:bg-orange-950",
}

export function RecentActivity({ activities, compact = false }: RecentActivityProps) {
    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase()

    return (
        <Card>
            <CardHeader className={compact ? "pb-3" : ""}>
                <CardTitle className={`flex items-center gap-2 ${compact ? "text-base" : ""}`}>
                    <Activity className="h-4 w-4" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className={compact ? "h-[300px]" : "h-[500px]"}>
                    <div className="space-y-1">
                        {activities.map((activity, index) => {
                            const Icon = ACTIVITY_ICONS[activity.type]
                            const colorClass = ACTIVITY_COLORS[activity.type]

                            return (
                                <div key={activity.id}>
                                    <div className="flex gap-3 py-3 px-1 rounded-lg hover:bg-muted/50 transition-colors">
                                        {/* Icon */}
                                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">
                                                <span className="font-semibold">{activity.user.name}</span>{" "}
                                                <span className="text-muted-foreground">{activity.action}</span>{" "}
                                                <span className="font-medium">{activity.target}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {activity.timestamp}
                                            </p>
                                        </div>

                                        {/* User Avatar */}
                                        <Avatar className="h-6 w-6 shrink-0">
                                            <AvatarImage src={activity.user.avatar} />
                                            <AvatarFallback className="text-[10px]">
                                                {getInitials(activity.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    {index < activities.length - 1 && (
                                        <div className="ml-5 border-l-2 border-muted h-2" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}