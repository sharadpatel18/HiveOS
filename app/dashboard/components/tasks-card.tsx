// app/dashboard/components/tasks-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Circle, Plus } from "lucide-react"
import { priorityBadge } from "../data/mock-data"

interface Task {
    title: string
    priority: "high" | "medium" | "low"
    due: string
    done: boolean
}

interface TasksCardProps {
    tasks: Task[]
}

export function TasksCard({ tasks }: TasksCardProps) {
    const pendingCount = tasks.filter((t) => !t.done).length

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">My Tasks</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                        {pendingCount} pending
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-4">
                <div className="flex flex-col gap-2.5">
                    {tasks.map((task, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-2.5 ${task.done ? "opacity-50" : ""}`}
                        >
                            {task.done ? (
                                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                            ) : (
                                <Circle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${task.done ? "line-through" : ""}`}>
                                    {task.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">Due {task.due}</p>
                            </div>
                            <Badge
                                variant={priorityBadge[task.priority]}
                                className="text-xs capitalize shrink-0"
                            >
                                {task.priority}
                            </Badge>
                        </div>
                    ))}
                </div>
                <Separator className="my-3" />
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add Task
                </Button>
            </CardContent>
        </Card>
    )
}