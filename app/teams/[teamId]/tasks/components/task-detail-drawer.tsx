import { X, Calendar, User, Tag, Clock, AlertCircle, CheckCircle2, Circle, Timer } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { TaskWithAssignees, TaskStatus, Task } from "@/types/task"
import { useEffect, useState } from "react"
import { getTaskById } from "@/services/task-service"

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    NOT_STARTED: {
        label: "Not Started",
        icon: <Circle className="w-3.5 h-3.5" />,
        color: "text-gray-500",
        bg: "bg-gray-100 dark:bg-gray-500/15 text-gray-700 dark:text-gray-300",
    },
    IN_PROGRESS: {
        label: "In Progress",
        icon: <Timer className="w-3.5 h-3.5" />,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300",
    },
    IN_REVIEW: {
        label: "In Review",
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300",
    },
    COMPLETED: {
        label: "Completed",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        color: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    },
    CANCELLED: {
        label: "Cancelled",
        icon: <X className="w-3.5 h-3.5" />,
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300",
    },
}

const PRIORITY_CONFIG = {
    LOW: { label: "Low", bg: "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400" },
    MEDIUM: { label: "Medium", bg: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    HIGH: { label: "High", bg: "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300" },
}

interface WithAssignData extends Task {
    assignee: {
        id: string
        name: string
        email: string
        role: string
        assignedBy: {
            id: string
            name: string
            email: string
            role: string
        }[]
    }[]
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 w-28 shrink-0 pt-0.5">
                <span className="text-muted-foreground">{icon}</span>
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
            </div>
            <div className="flex-1 text-sm">{children}</div>
        </div>
    )
}
export function TaskDetailDrawer({
    taskId,           // 👈 now accepts just the id instead of the full task object
    open,
    onClose,
    onEdit,
}: {
    taskId: string | null
    open: boolean
    onClose: () => void
    onEdit: (task: any) => void
}) {
    const [task, setTask] = useState<WithAssignData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!taskId || !open) return

        async function fetchTask() {
            setLoading(true)
            setError(null)
            try {
                const data = await getTaskById(taskId!)
                setTask(data)
            } catch (err) {
                setError("Failed to load task details.")
            } finally {
                setLoading(false)
            }
        }

        fetchTask()
    }, [taskId, open])   // re-fetches whenever a different task is clicked

    // clear task when drawer closes
    useEffect(() => {
        if (!open) setTask(null)
    }, [open])

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetHeader className="p-4 border-b">
                <SheetTitle></SheetTitle>
            </SheetHeader>

            <SheetContent
                side="right"
                className="w-full sm:w-[420px] sm:max-w-[420px] p-0 flex flex-col gap-0"
            >
                {/* ── Loading ── */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                            <span className="text-sm">Loading task...</span>
                        </div>
                    </div>
                )}

                {/* ── Error ── */}
                {!loading && error && (
                    <div className="flex-1 flex items-center justify-center px-6">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                            <p className="text-sm text-muted-foreground">{error}</p>
                            <button
                                onClick={() => taskId && getTaskById(taskId).then(setTask).catch(() => setError("Failed to load task details."))}
                                className="text-xs text-primary underline underline-offset-2 hover:no-underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Content (only renders when task is loaded) ── */}
                {!loading && !error && task && (
                    <>
                        {/* ── Header ── */}
                        <SheetHeader className="px-5 pt-5 pb-4 border-b">
                            <div className="flex items-start justify-between gap-3">
                                <SheetTitle className="text-base font-medium leading-snug text-left pr-2">
                                    {task.title}
                                </SheetTitle>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", STATUS_CONFIG[task.status].bg)}>
                                    <span className={STATUS_CONFIG[task.status].color}>{STATUS_CONFIG[task.status].icon}</span>
                                    {STATUS_CONFIG[task.status].label}
                                </span>
                                {task.priority && (
                                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]?.bg)}>
                                        {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()} Priority
                                    </span>
                                )}
                            </div>
                        </SheetHeader>

                        {/* ── Body ── */}
                        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
                            {task.description && (
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs font-medium text-muted-foreground">Description</span>
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                        {task.description}
                                    </p>
                                </div>
                            )}

                            <Separator />

                            <div className="flex flex-col gap-4">
                                {task.assignee?.length > 0 && (
                                    <DetailRow icon={<User className="w-3.5 h-3.5" />} label="Assignees">
                                        <div className="flex flex-wrap gap-2">
                                            {task.assignee.map((a) => (
                                                <div key={a.id} className="flex items-center gap-1.5">
                                                    <span className="text-sm">{a.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </DetailRow>
                                )}

                                {task.due && (
                                    <DetailRow icon={<Calendar className="w-3.5 h-3.5" />} label="Due Date">
                                        <span className={cn(
                                            "text-sm",
                                            new Date(task.due) < new Date() && task.status !== "COMPLETED"
                                                ? "text-red-500 font-medium"
                                                : "text-foreground"
                                        )}>
                                            {new Date(task.due).toLocaleDateString("en-US", {
                                                weekday: "short", year: "numeric", month: "short", day: "numeric",
                                            })}
                                        </span>
                                    </DetailRow>
                                )}

                                {task.createdAt && (
                                    <DetailRow icon={<Clock className="w-3.5 h-3.5" />} label="Created">
                                        <span className="text-sm">
                                            {new Date(task.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric", month: "short", day: "numeric",
                                            })}
                                        </span>
                                    </DetailRow>
                                )}

                                {/* {task.tags?.length > 0 && (
                                    <DetailRow icon={<Tag className="w-3.5 h-3.5" />} label="Tags">
                                        <div className="flex flex-wrap gap-1.5">
                                            {task.tags.map((tag) => (
                                                <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </DetailRow>
                                )} */}
                                {task.assignee?.length > 0 && (
                                    <>
                                        <Separator />

                                        <div className="space-y-4">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Assignee Details
                                            </p>

                                            {task.assignee.map((person) => (
                                                <div
                                                    key={person.id}
                                                    className="rounded-xl border bg-card p-4 space-y-4"
                                                >
                                                    {/* Assigned user */}
                                                    <div className="flex items-start gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback>
                                                                {person.name?.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">{person.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {person.email}
                                                            </p>
                                                            <Badge variant="secondary">{person.role}</Badge>
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    {/* Assigned by */}
                                                    {person.assignedBy && (
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-medium text-muted-foreground">
                                                                Assigned By
                                                            </p>

                                                            <div className="rounded-lg bg-muted p-3">
                                                                <div className="flex items-start gap-3">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarFallback>
                                                                            {person.assignedBy[0].name
                                                                                ?.charAt(0)
                                                                                .toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>

                                                                    <div className="space-y-1">
                                                                        <p className="text-sm font-medium">
                                                                            {person.assignedBy[0].name}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {person.assignedBy[0].email}
                                                                        </p>
                                                                        <Badge>{person.assignedBy[0].role}</Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div className="px-5 py-4 border-t flex gap-2">
                            <button
                                onClick={() => { onEdit(task); onClose() }}
                                className="flex-1 rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2 hover:bg-primary/90 transition-colors"
                            >
                                Edit Task
                            </button>
                            <button
                                onClick={onClose}
                                className="rounded-lg border px-4 text-sm font-medium py-2 hover:bg-muted transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}