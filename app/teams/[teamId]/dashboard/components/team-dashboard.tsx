// app/teams/[teamId]/dashboard/_components/team-dashboard.tsx
"use client"

import { useState } from "react"
import { TeamHeader } from "./team-header"
import { StatsOverview } from "./stats-overview"
import { TaskBoard } from "./task-board"
import { MembersList } from "./members-list"
import { RecentActivity } from "./recent-activity"
import { InviteMemberDialog } from "./invite-member-dialog"
import { CreateTaskDialog } from "./create-task-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ============== TYPES ==============
export interface TeamMember {
    id: string
    name: string
    email: string
    avatar?: string
    role: "team_lead" | "member" | "viewer"
    status: "online" | "offline" | "away"
    tasksCompleted: number
    tasksPending: number
    joinedAt: string
}

export interface Task {
    id: string
    title: string
    description: string
    status: "backlog" | "todo" | "in_progress" | "in_review" | "done"
    priority: "urgent" | "high" | "medium" | "low"
    assignee?: TeamMember
    dueDate?: string
    labels: string[]
    subtasks: { total: number; completed: number }
    createdAt: string
}

export interface Activity {
    id: string
    user: { name: string; avatar?: string }
    action: string
    target: string
    timestamp: string
    type: "task" | "member" | "team" | "comment"
}

export interface TeamDetails {
    id: string
    name: string
    description: string
    department: string
    visibility: "public" | "private"
    createdAt: string
    lead: TeamMember
    membersCount: number
    members: TeamMember[]
    tasks: Task[]
    activities: Activity[]
    stats: {
        totalTasks: number
        completedTasks: number
        overdueTasks: number
        activeMembers: number
        completionRate: number
        avgTaskTime: string
    }
}

// ============== MOCK DATA ==============
const MOCK_TEAM: TeamDetails = {
    id: "team-001",
    name: "Frontend Engineering",
    description:
        "Responsible for building and maintaining all client-facing applications, UI components, and frontend infrastructure.",
    department: "Engineering",
    visibility: "private",
    createdAt: "2024-01-15",
    lead: {
        id: "user-001",
        name: "Sarah Johnson",
        email: "sarah@company.com",
        avatar: "",
        role: "team_lead",
        status: "online",
        tasksCompleted: 47,
        tasksPending: 3,
        joinedAt: "2024-01-15",
    },
    membersCount: 8,
    members: [
        {
            id: "user-001",
            name: "Sarah Johnson",
            email: "sarah@company.com",
            role: "team_lead",
            status: "online",
            tasksCompleted: 47,
            tasksPending: 3,
            joinedAt: "2024-01-15",
        },
        {
            id: "user-002",
            name: "Alex Chen",
            email: "alex@company.com",
            role: "member",
            status: "online",
            tasksCompleted: 32,
            tasksPending: 5,
            joinedAt: "2024-02-01",
        },
        {
            id: "user-003",
            name: "Maria Garcia",
            email: "maria@company.com",
            role: "member",
            status: "away",
            tasksCompleted: 28,
            tasksPending: 4,
            joinedAt: "2024-02-10",
        },
        {
            id: "user-004",
            name: "James Wilson",
            email: "james@company.com",
            role: "member",
            status: "offline",
            tasksCompleted: 19,
            tasksPending: 6,
            joinedAt: "2024-03-01",
        },
        {
            id: "user-005",
            name: "Emily Davis",
            email: "emily@company.com",
            role: "member",
            status: "online",
            tasksCompleted: 35,
            tasksPending: 2,
            joinedAt: "2024-02-20",
        },
        {
            id: "user-006",
            name: "Ryan Park",
            email: "ryan@company.com",
            role: "member",
            status: "online",
            tasksCompleted: 22,
            tasksPending: 7,
            joinedAt: "2024-03-15",
        },
        {
            id: "user-007",
            name: "Lisa Thompson",
            email: "lisa@company.com",
            role: "viewer",
            status: "offline",
            tasksCompleted: 0,
            tasksPending: 0,
            joinedAt: "2024-04-01",
        },
        {
            id: "user-008",
            name: "David Kim",
            email: "david@company.com",
            role: "member",
            status: "away",
            tasksCompleted: 15,
            tasksPending: 3,
            joinedAt: "2024-04-10",
        },
    ],
    tasks: [
        {
            id: "task-001",
            title: "Redesign user settings page",
            description: "Complete overhaul of the settings UI with new design system",
            status: "in_progress",
            priority: "high",
            assignee: {
                id: "user-002",
                name: "Alex Chen",
                email: "alex@company.com",
                role: "member",
                status: "online",
                tasksCompleted: 32,
                tasksPending: 5,
                joinedAt: "2024-02-01",
            },
            dueDate: "2024-12-20",
            labels: ["UI", "Design System"],
            subtasks: { total: 5, completed: 3 },
            createdAt: "2024-12-01",
        },
        {
            id: "task-002",
            title: "Fix navigation responsive issues",
            description: "Navigation breaks on tablet viewport sizes",
            status: "todo",
            priority: "urgent",
            assignee: {
                id: "user-003",
                name: "Maria Garcia",
                email: "maria@company.com",
                role: "member",
                status: "away",
                tasksCompleted: 28,
                tasksPending: 4,
                joinedAt: "2024-02-10",
            },
            dueDate: "2024-12-15",
            labels: ["Bug", "Responsive"],
            subtasks: { total: 3, completed: 0 },
            createdAt: "2024-12-05",
        },
        {
            id: "task-003",
            title: "Implement dark mode toggle",
            description: "Add dark mode support across the application",
            status: "in_review",
            priority: "medium",
            assignee: {
                id: "user-005",
                name: "Emily Davis",
                email: "emily@company.com",
                role: "member",
                status: "online",
                tasksCompleted: 35,
                tasksPending: 2,
                joinedAt: "2024-02-20",
            },
            dueDate: "2024-12-18",
            labels: ["Feature", "Theme"],
            subtasks: { total: 8, completed: 7 },
            createdAt: "2024-11-28",
        },
        {
            id: "task-004",
            title: "Optimize bundle size",
            description: "Reduce initial JS bundle by 30%",
            status: "todo",
            priority: "high",
            assignee: {
                id: "user-006",
                name: "Ryan Park",
                email: "ryan@company.com",
                role: "member",
                status: "online",
                tasksCompleted: 22,
                tasksPending: 7,
                joinedAt: "2024-03-15",
            },
            dueDate: "2024-12-25",
            labels: ["Performance"],
            subtasks: { total: 4, completed: 1 },
            createdAt: "2024-12-03",
        },
        {
            id: "task-005",
            title: "Write E2E tests for auth flow",
            description: "Cypress tests for login, signup, forgot password",
            status: "backlog",
            priority: "medium",
            labels: ["Testing"],
            subtasks: { total: 6, completed: 0 },
            createdAt: "2024-12-07",
        },
        {
            id: "task-006",
            title: "Update component library docs",
            description: "Document all shared components with examples",
            status: "done",
            priority: "low",
            assignee: {
                id: "user-004",
                name: "James Wilson",
                email: "james@company.com",
                role: "member",
                status: "offline",
                tasksCompleted: 19,
                tasksPending: 6,
                joinedAt: "2024-03-01",
            },
            dueDate: "2024-12-10",
            labels: ["Documentation"],
            subtasks: { total: 10, completed: 10 },
            createdAt: "2024-11-25",
        },
        {
            id: "task-007",
            title: "Migrate to React Query v5",
            description: "Update all data fetching to use React Query v5 patterns",
            status: "in_progress",
            priority: "high",
            assignee: {
                id: "user-001",
                name: "Sarah Johnson",
                email: "sarah@company.com",
                role: "team_lead",
                status: "online",
                tasksCompleted: 47,
                tasksPending: 3,
                joinedAt: "2024-01-15",
            },
            dueDate: "2024-12-22",
            labels: ["Refactor", "Infrastructure"],
            subtasks: { total: 12, completed: 5 },
            createdAt: "2024-12-02",
        },
        {
            id: "task-008",
            title: "Add analytics dashboard widgets",
            description: "Create reusable chart components for analytics",
            status: "backlog",
            priority: "medium",
            labels: ["Feature", "Charts"],
            subtasks: { total: 7, completed: 0 },
            createdAt: "2024-12-08",
        },
        {
            id: "task-009",
            title: "Fix memory leak in WebSocket hook",
            description: "WebSocket connections not properly cleaned up",
            status: "todo",
            priority: "urgent",
            assignee: {
                id: "user-008",
                name: "David Kim",
                email: "david@company.com",
                role: "member",
                status: "away",
                tasksCompleted: 15,
                tasksPending: 3,
                joinedAt: "2024-04-10",
            },
            dueDate: "2024-12-14",
            labels: ["Bug", "Critical"],
            subtasks: { total: 2, completed: 1 },
            createdAt: "2024-12-09",
        },
        {
            id: "task-010",
            title: "Implement file upload with drag & drop",
            description: "Support drag and drop file uploads with preview",
            status: "done",
            priority: "medium",
            assignee: {
                id: "user-002",
                name: "Alex Chen",
                email: "alex@company.com",
                role: "member",
                status: "online",
                tasksCompleted: 32,
                tasksPending: 5,
                joinedAt: "2024-02-01",
            },
            dueDate: "2024-12-08",
            labels: ["Feature", "UX"],
            subtasks: { total: 4, completed: 4 },
            createdAt: "2024-11-20",
        },
    ],
    activities: [
        {
            id: "act-001",
            user: { name: "Alex Chen" },
            action: "moved task",
            target: '"Redesign user settings page" to In Progress',
            timestamp: "2 minutes ago",
            type: "task",
        },
        {
            id: "act-002",
            user: { name: "Sarah Johnson" },
            action: "commented on",
            target: '"Migrate to React Query v5"',
            timestamp: "15 minutes ago",
            type: "comment",
        },
        {
            id: "act-003",
            user: { name: "Emily Davis" },
            action: "completed subtask in",
            target: '"Implement dark mode toggle"',
            timestamp: "1 hour ago",
            type: "task",
        },
        {
            id: "act-004",
            user: { name: "David Kim" },
            action: "was added to",
            target: "Frontend Engineering team",
            timestamp: "3 hours ago",
            type: "member",
        },
        {
            id: "act-005",
            user: { name: "Sarah Johnson" },
            action: "created task",
            target: '"Fix memory leak in WebSocket hook"',
            timestamp: "5 hours ago",
            type: "task",
        },
        {
            id: "act-006",
            user: { name: "James Wilson" },
            action: "completed task",
            target: '"Update component library docs"',
            timestamp: "1 day ago",
            type: "task",
        },
        {
            id: "act-007",
            user: { name: "Ryan Park" },
            action: "changed priority of",
            target: '"Optimize bundle size" to High',
            timestamp: "1 day ago",
            type: "task",
        },
        {
            id: "act-008",
            user: { name: "Maria Garcia" },
            action: "attached file to",
            target: '"Fix navigation responsive issues"',
            timestamp: "2 days ago",
            type: "task",
        },
    ],
    stats: {
        totalTasks: 10,
        completedTasks: 2,
        overdueTasks: 1,
        activeMembers: 5,
        completionRate: 68,
        avgTaskTime: "3.2 days",
    },
}

interface TeamDashboardProps {
    teamId: string
}

export default function TeamDashboard({ teamId }: TeamDashboardProps) {
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
    const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false)

    // In real app, fetch team data using teamId
    const team = MOCK_TEAM

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
                {/* Team Header */}
                <TeamHeader
                    team={team}
                    onInviteMember={() => setInviteDialogOpen(true)}
                    onCreateTask={() => setCreateTaskDialogOpen(true)}
                />

                {/* Stats Overview */}
                <StatsOverview stats={team.stats} />

                {/* Main Content Tabs */}
                <Tabs defaultValue="board" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                        <TabsTrigger value="board">Task Board</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="board" className="space-y-4">
                        <TaskBoard
                            tasks={team.tasks}
                            members={team.members}
                            onCreateTask={() => setCreateTaskDialogOpen(true)}
                        />
                    </TabsContent>

                    <TabsContent value="members" className="space-y-4">
                        <MembersList
                            members={team.members}
                            onInvite={() => setInviteDialogOpen(true)}
                        />
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                        <RecentActivity activities={team.activities} />
                    </TabsContent>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <MembersList
                                members={team.members}
                                onInvite={() => setInviteDialogOpen(true)}
                                compact
                            />
                            <RecentActivity activities={team.activities.slice(0, 5)} compact />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Dialogs */}
            <InviteMemberDialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
                teamName={team.name}
            />
            <CreateTaskDialog
                open={createTaskDialogOpen}
                onOpenChange={setCreateTaskDialogOpen}
                members={team.members}
            />
        </div>
    )
}