// app/teams/[teamId]/dashboard/_components/task-board.tsx
"use client"

import { useState } from "react"
import {
    Calendar,
    GripVertical,
    MessageSquare,
    MoreHorizontal,
    Paperclip,
    Plus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Task, TeamMember } from "./team-dashboard"

interface TaskBoardProps {
    tasks: Task[]
    members: TeamMember[]
    onCreateTask: () => void
}

const COLUMNS = [
    { id: "backlog" as const, title: "Backlog", color: "bg-slate-400" },
    { id: "todo" as const, title: "To Do", color: "bg-blue-400" },
    { id: "in_progress" as const, title: "In Progress", color: "bg-yellow-400" },
    { id: "in_review" as const, title: "In Review", color: "bg-purple-400" },
    { id: "done" as const, title: "Done", color: "bg-green-400" },
]

const PRIORITY_CONFIG = {
    urgent: { label: "Urgent", variant: "destructive" as const, dot: "bg-red-500" },
    high: { label: "High", variant: "default" as const, dot: "bg-orange-500" },
    medium: { label: "Medium", variant: "secondary" as const, dot: "bg-yellow-500" },
    low: { label: "Low", variant: "outline" as const, dot: "bg-green-500" },
}

export function TaskBoard({ tasks, members, onCreateTask }: TaskBoardProps) {
    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase()

    const getTasksByStatus = (status: Task["status"]) =>
        tasks.filter((task) => task.status === status)

    const isOverdue = (dueDate?: string) => {
        if (!dueDate) return false
        return new Date(dueDate) < new Date()
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    return (
        <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4 min-w-max">
                {COLUMNS.map((column) => {
                    const columnTasks = getTasksByStatus(column.id)

                    return (
                        <div key={column.id} className="w-[320px] flex-shrink-0">
                            <Card className="bg-muted/30">
                                <CardHeader className="p-3 pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
                                            <CardTitle className="text-sm font-semibold">
                                                {column.title}
                                            </CardTitle>
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[11px]">
                                                {columnTasks.length}
                                            </Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={onCreateTask}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-2 pt-0 space-y-2">
                                    {columnTasks.length === 0 ? (
                                        <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                                            <p className="text-xs text-muted-foreground">No tasks</p>
                                        </div>
                                    ) : (
                                        columnTasks.map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                isOverdue={column.id !== "done" && isOverdue(task.dueDate)}
                                                getInitials={getInitials}
                                                formatDate={formatDate}
                                            />
                                        ))
                                    )}

                                    {/* Add Task Button */}
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-8 text-xs"
                                        onClick={onCreateTask}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add task
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )
                })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}

// ----------- Individual Task Card -----------
interface TaskCardProps {
    task: Task
    isOverdue: boolean
    getInitials: (name: string) => string
    formatDate: (date: string) => string
}

function TaskCard({ task, isOverdue, getInitials, formatDate }: TaskCardProps) {
    const priorityConfig = PRIORITY_CONFIG[task.priority]
    const subtaskProgress =
        task.subtasks.total > 0
            ? Math.round((task.subtasks.completed / task.subtasks.total) * 100)
            : 0

    return (
        <Card className="group cursor-pointer shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <CardContent className="p-3 space-y-2.5">
                {/* Priority & Labels Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                            <div className={`h-2 w-2 rounded-full ${priorityConfig.dot}`} />
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">
                                {priorityConfig.label}
                            </span>
                        </div>
                        {task.labels.slice(0, 2).map((label) => (
                            <Badge key={label} variant="outline" className="h-4 px-1.5 text-[10px]">
                                {label}
                            </Badge>
                        ))}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem>Edit Task</DropdownMenuItem>
                            <DropdownMenuItem>Assign Member</DropdownMenuItem>
                            <DropdownMenuItem>Change Priority</DropdownMenuItem>
                            <DropdownMenuItem>Copy Link</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Task Title */}
                <p className="text-sm font-medium leading-tight">{task.title}</p>

                {/* Subtask Progress */}
                {task.subtasks.total > 0 && (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Subtasks</span>
                            <span>
                                {task.subtasks.completed}/{task.subtasks.total}
                            </span>
                        </div>
                        <Progress value={subtaskProgress} className="h-1" />
                    </div>
                )}

                {/* Footer: Date + Assignee */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        {task.dueDate && (
                            <div className={`flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : ""}`}>
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(task.dueDate)}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>3</span>
                        </div>
                    </div>

                    {task.assignee && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={task.assignee.avatar} />
                                        <AvatarFallback className="text-[10px]">
                                            {getInitials(task.assignee.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{task.assignee.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}