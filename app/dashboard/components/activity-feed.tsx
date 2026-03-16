// app/dashboard/components/activity-feed.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowUpRight, Clock } from "lucide-react"
import { activityIcon } from "../data/mock-data"

interface Activity {
    user: string
    avatar: string
    action: string
    role: string
    time: string
    type: "invite" | "task" | "interview" | "member"
}

interface ActivityFeedProps {
    activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                        View all <ArrowUpRight className="h-3 w-3" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-4">
                <div className="flex flex-col gap-4">
                    {activities.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 text-xs">
                                <AvatarFallback>{item.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm leading-snug">
                                    <span className="font-medium">{item.user}</span>
                                    <span className="text-muted-foreground"> {item.action} </span>
                                    <span className="font-medium text-foreground/80">{item.role}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {item.time}
                                </p>
                            </div>
                            <div className="mt-0.5">{activityIcon[item.type]}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}