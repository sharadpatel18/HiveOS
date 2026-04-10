"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
    TaskWithAssignees, TaskStatus, taskStatuses, taskPriorities, TaskPriority,
} from "@/types/task"
import { format } from "date-fns"
import {
    CalendarIcon, Plus, CircleDashed, Timer, Eye, CheckCircle2,
    XCircle, MoreHorizontal, Pencil, Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useGetTasksByTeam, useInvalidateTasks } from "@/hooks/use-tasks"
import { useCompany } from "@/hooks/use-company"
import { createTask, deleteTaskById, updateTaskById } from "@/services/task-service"
import { taskValidation } from "@/validations/task.validation"
import {
    DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent,
    PointerSensor, useSensor, useSensors, closestCorners,
} from "@dnd-kit/core"
import {
    SortableContext, verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useTeamsDetails } from "@/hooks/use-teams"
import { useSession } from "next-auth/react"
import { TaskDetailDrawer } from "./task-detail-drawer"
import { useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks"
// ── Kanban config ─────────────────────────────────────────────────────────────

const COLUMNS: { status: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { status: "NOT_STARTED", label: "Not Started", icon: <CircleDashed className="size-4" />, color: "text-muted-foreground" },
    { status: "IN_PROGRESS", label: "In Progress", icon: <Timer className="size-4" />, color: "text-blue-500" },
    { status: "IN_REVIEW", label: "In Review", icon: <Eye className="size-4" />, color: "text-yellow-500" },
    { status: "COMPLETED", label: "Completed", icon: <CheckCircle2 className="size-4" />, color: "text-green-500" },
    { status: "CANCELLED", label: "Cancelled", icon: <XCircle className="size-4" />, color: "text-red-500" },
]

const PRIORITY_BADGE: Record<string, string> = {
    LOW: "bg-secondary text-secondary-foreground",
    MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    URGENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
}

const STATUS_STYLES: Record<TaskStatus, { bg: string; border: string; blur: string; card: string }> = {
    NOT_STARTED: {
        bg: "bg-gray-500/8 dark:bg-gray-400/6",
        border: "border border-gray-400/20 dark:border-gray-400/15",
        blur: "backdrop-blur-sm",
        card: "bg-gray-100/80 dark:bg-gray-500/10 border-gray-200/60 dark:border-gray-400/15",
    },
    IN_PROGRESS: {
        bg: "bg-blue-500/8 dark:bg-blue-400/6",
        border: "border border-blue-400/20 dark:border-blue-400/15",
        blur: "backdrop-blur-sm",
        card: "bg-blue-50/80 dark:bg-blue-500/10 border-blue-200/60 dark:border-blue-400/15",
    },
    IN_REVIEW: {
        bg: "bg-amber-500/8 dark:bg-amber-400/6",
        border: "border border-amber-400/20 dark:border-amber-400/15",
        blur: "backdrop-blur-sm",
        card: "bg-amber-50/80 dark:bg-amber-500/10 border-amber-200/60 dark:border-amber-400/15",
    },
    COMPLETED: {
        bg: "bg-emerald-500/8 dark:bg-emerald-400/6",
        border: "border border-emerald-400/20 dark:border-emerald-400/15",
        blur: "backdrop-blur-sm",
        card: "bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-400/15",
    },
    CANCELLED: {
        bg: "bg-red-500/8 dark:bg-red-400/6",
        border: "border border-red-400/20 dark:border-red-400/15",
        blur: "backdrop-blur-sm",
        card: "bg-red-50/80 dark:bg-red-500/10 border-red-200/60 dark:border-red-400/15",
    },
}

// ── Task card ─────────────────────────────────────────────────────────────────

function TaskCard({
    task, onEdit, onDelete, isDragging = false, onTaskClick
}: {
    task: TaskWithAssignees
    onEdit: (task: TaskWithAssignees) => void
    onDelete: (task: TaskWithAssignees) => void
    isDragging?: boolean
    onTaskClick?: (task: TaskWithAssignees) => void
}) {
    const cardStyle = STATUS_STYLES[task.status].card   // 👈 pick up the color
    return (
        <div
            onClick={() => onTaskClick?.(task)}
            className={cn(
                "rounded-lg border bg-card p-3 shadow-sm space-y-2 transition-shadow",
                cardStyle,
                isDragging ? "opacity-50 shadow-lg rotate-1" : "hover:shadow-md"
            )}>
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-snug flex-1">{task.title}</p>
                <div className="flex items-center gap-1 shrink-0">
                    <Badge className={cn("text-xs capitalize", PRIORITY_BADGE[task.priority])}>
                        {task.priority.toLowerCase()}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 text-muted-foreground hover:text-foreground"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                                className="gap-2 cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); onEdit(task) }}
                            >
                                <Pencil className="size-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={(e) => { e.stopPropagation(); onDelete(task) }}
                            >
                                <Trash2 className="size-3.5" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                    {format(new Date(task.due), "MMM d")}
                </span>
                <div className="flex -space-x-1.5">
                    {task.assignees.slice(0, 3).map((a) => (
                        <Avatar key={a.id} className="size-6 border-2 border-background">
                            <AvatarFallback className="text-[10px]">
                                {a.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                    {task.assignees.length > 3 && (
                        <div className="size-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                            +{task.assignees.length - 3}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Sortable task card wrapper ─────────────────────────────────────────────────

function SortableTaskCard({
    task, onEdit, onDelete, onTaskClick
}: {
    task: TaskWithAssignees
    onEdit: (task: TaskWithAssignees) => void
    onDelete: (task: TaskWithAssignees) => void
    onTaskClick: (task: TaskWithAssignees) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { task },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: isDragging ? "grabbing" : "grab",
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} isDragging={isDragging} onTaskClick={onTaskClick} />
        </div>
    )
}

// ── Kanban column ─────────────────────────────────────────────────────────────

function KanbanColumn({
    status, label, icon, color, tasks, onEdit, onDelete,
    onTaskClick
}: {
    status: TaskStatus; label: string; icon: React.ReactNode
    color: string; tasks: TaskWithAssignees[]
    onEdit: (task: TaskWithAssignees) => void
    onDelete: (task: TaskWithAssignees) => void
    onTaskClick: (task: TaskWithAssignees) => void
}) {
    const styles = STATUS_STYLES[status]
    return (
        <div
            className="flex flex-col gap-3 w-[280px] md:w-[260px] lg:flex-1 shrink-0"
            data-column-id={status}
        >
            <div className="flex items-center gap-2 px-1">
                <span className={color}>{icon}</span>
                <span className="text-sm font-medium">{label}</span>
                <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">
                    {tasks.length}
                </Badge>
            </div>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div
                    className={cn(
                        "flex flex-col gap-2 rounded-xl p-2 min-h-[120px] flex-1",
                        styles.bg,
                        styles.border,
                        styles.blur,
                    )}
                    data-droppable-id={status}
                >
                    {tasks.map((t) => (
                        <SortableTaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onTaskClick={onTaskClick} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex-1 flex items-center justify-center py-6">
                            <p className="text-xs text-muted-foreground">No tasks</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    )
}

// ── Mobile Kanban ─────────────────────────────────────────────────────────────

function MobileKanban({
    grouped, onEdit, onDelete, onTaskClick
}: {
    grouped: Record<TaskStatus, TaskWithAssignees[]>
    onEdit: (task: TaskWithAssignees) => void
    onDelete: (task: TaskWithAssignees) => void
    onTaskClick: (task: TaskWithAssignees) => void
}) {
    const [activeStatus, setActiveStatus] = useState<TaskStatus>("NOT_STARTED")
    const activeColumn = COLUMNS.find((c) => c.status === activeStatus)!
    const styles = STATUS_STYLES[activeStatus]

    return (
        <div className="flex flex-col gap-3">
            <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                    {COLUMNS.map((col) => (
                        <button
                            key={col.status}
                            onClick={() => setActiveStatus(col.status)}
                            className={cn(
                                "flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                                activeStatus === col.status
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                            )}
                        >
                            <span className={activeStatus === col.status ? "text-primary-foreground" : col.color}>
                                {col.icon}
                            </span>
                            {col.label}
                            <span className={cn(
                                "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                activeStatus === col.status
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            )}>
                                {grouped[col.status]?.length ?? 0}
                            </span>
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className={cn(
                "flex flex-col gap-2 rounded-xl p-2",
                styles.bg,
                styles.border,
                styles.blur,
            )}>
                {grouped[activeStatus]?.length > 0 ? (
                    grouped[activeStatus].map((t) => (
                        <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onTaskClick={onTaskClick} />
                    ))
                ) : (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-xs text-muted-foreground">No tasks in {activeColumn.label}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Create / Edit task dialog ─────────────────────────────────────────────────

function TaskDialog({
    companyId, teamId, assignedById, onSuccess,
    editTask, open, onOpenChange, team,
}: {
    companyId: string
    teamId: string
    assignedById: string
    onSuccess: () => void
    editTask?: TaskWithAssignees | null
    open: boolean
    onOpenChange: (v: boolean) => void
    team?: { members?: { id: string; name: string; email: string; role: string }[] } | null
}) {
    const isEdit = !!editTask
    const [title, setTitle] = useState(editTask?.title ?? "")
    const [description, setDescription] = useState(editTask?.description ?? "")
    const [priority, setPriority] = useState<TaskPriority>(editTask?.priority ?? "MEDIUM")
    const [status, setStatus] = useState<TaskStatus>(editTask?.status ?? "NOT_STARTED")
    const [dueDate, setDueDate] = useState<Date | undefined>(
        editTask?.due ? new Date(editTask.due) : undefined
    )
    const [assigneeIds, setAssigneeIds] = useState<string[]>(
        editTask?.assignees?.map((a) => a.id) ?? [assignedById]
    )
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const members = team?.members ?? []
    const createTaskMutation = useCreateTask(companyId, teamId);
    const updateTaskMutation = useUpdateTask(companyId, teamId);

    // sync state when editTask changes
    useEffect(() => {
        if (editTask) {
            setTitle(editTask.title ?? "")
            setDescription(editTask.description ?? "")
            setPriority(editTask.priority ?? "MEDIUM")
            setStatus(editTask.status ?? "NOT_STARTED")
            setDueDate(editTask.due ? new Date(editTask.due) : undefined)
            setAssigneeIds(editTask.assignees?.map((a) => a.id) ?? [assignedById])
        } else {
            setTitle("")
            setDescription("")
            setPriority("MEDIUM")
            setStatus("NOT_STARTED")
            setDueDate(undefined)
            setAssigneeIds([assignedById])
        }
    }, [editTask, open])

    function toggleAssignee(memberId: string) {
        setAssigneeIds((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        )
    }

    const handleSubmit = async () => {
        const result = taskValidation.safeParse({
            title,
            description,
            priority,
            status,
            dueDate,
            companyId,
            teamId,
            assignedById,
            assigneeIds:
                assigneeIds.length > 0
                    ? assigneeIds
                    : [assignedById],
        });

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};

            result.error.issues.forEach((issue) => {
                fieldErrors[issue.path[0] as string] =
                    issue.message;
            });

            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            if (isEdit && editTask) {
                await updateTaskMutation.mutateAsync({
                    id: editTask.id,
                    status: result.data.status,
                });

                toast.success("Task updated");
            } else {
                await createTaskMutation.mutateAsync(
                    result.data
                );

                toast.success("Task created");
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast.error(
                error?.message ||
                "Something went wrong"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Task" : "Create Task"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Title</label>
                        <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea placeholder="Describe the task..." rows={3} value={description}
                            onChange={(e) => setDescription(e.target.value)} />
                        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Priority</label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {taskPriorities.map((p) => (
                                        <SelectItem key={p} value={p} className="capitalize">
                                            {p.toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {taskStatuses.map((s) => (
                                        <SelectItem key={s} value={s} className="capitalize">
                                            {s.replace(/_/g, " ").toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Due Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline"
                                    className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 size-4" />
                                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={dueDate} onSelect={setDueDate}
                                    disabled={(d: Date) => d < new Date()} initialFocus />
                            </PopoverContent>
                        </Popover>
                        {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
                    </div>

                    {/* ── Assignees ── */}
                    {members.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Assignees</label>
                            <div className="rounded-lg border divide-y">
                                {members.map((member) => {
                                    const selected = assigneeIds.includes(member.id)
                                    return (
                                        <button
                                            key={member.id}
                                            type="button"
                                            onClick={() => toggleAssignee(member.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                                                selected
                                                    ? "bg-primary/5 hover:bg-primary/10"
                                                    : "hover:bg-muted/50"
                                            )}
                                        >
                                            <Avatar className="size-7 shrink-0">
                                                <AvatarFallback className={cn(
                                                    "text-[11px] font-semibold",
                                                    selected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted text-muted-foreground"
                                                )}>
                                                    {member.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{member.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="secondary" className="text-[10px] capitalize h-4 px-1">
                                                    {member.role.toLowerCase().replace("_", " ")}
                                                </Badge>
                                                <div className={cn(
                                                    "size-4 rounded-full border-2 flex items-center justify-center transition-colors",
                                                    selected
                                                        ? "border-primary bg-primary"
                                                        : "border-muted-foreground/40"
                                                )}>
                                                    {selected && (
                                                        <svg className="size-2.5 text-primary-foreground" fill="none" viewBox="0 0 12 12">
                                                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                            {assigneeIds.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    No assignees selected — task will be assigned to you by default.
                                </p>
                            )}
                            {errors.assigneeIds && (
                                <p className="text-xs text-destructive">{errors.assigneeIds}</p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Task")}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── Delete confirm dialog ─────────────────────────────────────────────────────

function DeleteTaskDialog({
    task, open, onOpenChange, onSuccess, deleteTaskMutation
}: {
    task: TaskWithAssignees | null
    open: boolean
    onOpenChange: (v: boolean) => void
    onSuccess: () => void
    deleteTaskMutation: any
}) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        if (!task) return
        setIsLoading(true)
        try {

            await deleteTaskMutation.mutateAsync(task.id)
            toast.success("Task deleted")
            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-sm">
                <DialogHeader>
                    <DialogTitle>Delete Task</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete <span className="font-medium text-foreground">"{task?.title}"</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function KanbanSkeleton() {
    return (
        <>
            <div className="flex flex-col gap-3 md:hidden">
                <div className="flex gap-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
                </div>
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
            </div>
            <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                    <div key={col.status} className="flex flex-col gap-3 w-[260px] lg:flex-1 shrink-0">
                        <Skeleton className="h-5 w-28" />
                        <div className="rounded-xl bg-muted/40 p-2 space-y-2 min-h-[200px]">
                            {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

// ── Main content ──────────────────────────────────────────────────────────────

export function TasksContent({ teamId }: { teamId: string }) {
    const { data: company } = useCompany()
    const companyId = company?.id ?? ""
    const { data: user, status: sessionStatus } = useSession()
    const { data: tasks = [], isLoading } = useGetTasksByTeam(companyId, teamId)
    const { data: team } = useTeamsDetails(teamId)
    const invalidateTasks = useInvalidateTasks(companyId, teamId)

    // local optimistic state
    const [localTasks, setLocalTasks] = useState<TaskWithAssignees[]>([])
    const allTasks = localTasks.length > 0 ? localTasks : tasks

    // drag state
    const [activeTask, setActiveTask] = useState<TaskWithAssignees | null>(null)

    // dialog state
    const [createOpen, setCreateOpen] = useState(false)
    const [editTask, setEditTask] = useState<TaskWithAssignees | null>(null)
    const [deleteTask_, setDeleteTask] = useState<TaskWithAssignees | null>(null)
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const deleteTaskMutation = useDeleteTask(companyId, teamId);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    )

    const grouped = COLUMNS.reduce((acc, col) => {
        acc[col.status] = allTasks.filter((t: any) => t.status === col.status)
        return acc
    }, {} as Record<TaskStatus, TaskWithAssignees[]>)

    // sync localTasks when server data changes
    if (tasks.length > 0 && localTasks.length === 0) {
        setLocalTasks(tasks)
    }

    function handleDragStart(event: DragStartEvent) {
        const task = allTasks.find((t: any) => t.id === event.active.id)
        if (task) setActiveTask(task)
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // find which column the over target belongs to
        const overColumn = COLUMNS.find((col) =>
            col.status === overId ||
            allTasks.find((t: any) => t.id === overId)?.status === col.status
        )
        if (!overColumn) return

        const activeTask = allTasks.find((t: any) => t.id === activeId)
        if (!activeTask || activeTask.status === overColumn.status) return

        // optimistically move task to new column
        setLocalTasks((prev) =>
            prev.map((t) =>
                t.id === activeId ? { ...t, status: overColumn.status } : t
            )
        )
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveTask(null)
        if (!over) return

        const activeId = active.id as string
        const task = allTasks.find((t: any) => t.id === activeId)
        if (!task) return

        // find destination column
        const overColumn = COLUMNS.find((col) =>
            col.status === over.id ||
            allTasks.find((t: any) => t.id === over.id)?.status === col.status
        )
        if (!overColumn || task.status === overColumn.status) return

        try {
            await updateTaskById({ id: activeId, status: overColumn.status })
            invalidateTasks()
        } catch {
            // revert on failure
            setLocalTasks(tasks)
            toast.error("Failed to update task status")
        }
    }

    if (sessionStatus === "loading") {
        return <KanbanSkeleton />

    }
    return (
        <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold md:text-xl">Tasks</h1>
                    <p className="text-xs text-muted-foreground md:text-sm">
                        {allTasks.length} task{allTasks.length !== 1 ? "s" : ""} in this team
                    </p>
                </div>
                {
                    user?.user.role !== "EMPLOYEE" && (
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create task
                        </Button>
                    )
                }
            </div>

            {isLoading ? (
                <KanbanSkeleton />
            ) : (
                <>
                    {/* Mobile */}
                    <div className="md:hidden">
                        <MobileKanban
                            grouped={grouped}
                            onEdit={(t) => setEditTask(t)}
                            onDelete={(t) => setDeleteTask(t)}
                            onTaskClick={(t) => { setSelectedTaskId(t.id); setDrawerOpen(true) }}
                        />
                    </div>

                    {/* Desktop with DnD */}
                    <div className="hidden md:block">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            <ScrollArea className="w-full">
                                <div className="flex gap-3 pb-4 lg:gap-4">
                                    {COLUMNS.map((col) => (
                                        <KanbanColumn
                                            key={col.status}
                                            {...col}
                                            tasks={grouped[col.status] ?? []}
                                            onEdit={(t) => setEditTask(t)}
                                            onDelete={(t) => setDeleteTask(t)}
                                            onTaskClick={(t) => { setSelectedTaskId(t.id); setDrawerOpen(true) }}
                                        />
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>

                            {/* Drag overlay — floating card while dragging */}
                            <DragOverlay>
                                {activeTask && (
                                    <div className="rotate-2 opacity-95 shadow-2xl">
                                        <TaskCard
                                            task={activeTask}
                                            onEdit={() => { }}
                                            onDelete={() => { }}
                                        />
                                    </div>
                                )}
                            </DragOverlay>
                        </DndContext>
                    </div>
                </>
            )}

            {
                drawerOpen && (
                    <TaskDetailDrawer
                        taskId={selectedTaskId}
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        onEdit={(task) => { setEditTask(task); setDrawerOpen(false) }}
                    />
                )
            }
            {/* Create dialog */}
            <TaskDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                companyId={companyId}
                teamId={teamId}
                assignedById={company?.userId ?? ""}
                team={team}
                onSuccess={() => { setLocalTasks([]); invalidateTasks() }}
            />

            {/* Edit dialog */}
            <TaskDialog
                open={!!editTask}
                onOpenChange={(v) => !v && setEditTask(null)}
                companyId={companyId}
                teamId={teamId}
                assignedById={company?.userId ?? ""}
                editTask={editTask}
                team={team}
                onSuccess={() => { setLocalTasks([]); invalidateTasks() }}
            />

            {/* Delete confirm dialog */}
            <DeleteTaskDialog
                task={deleteTask_}
                open={!!deleteTask_}
                onOpenChange={(v) => !v && setDeleteTask(null)}
                onSuccess={() => { setLocalTasks([]); invalidateTasks() }}
                deleteTaskMutation={deleteTaskMutation}
            />
        </div>
    )
}