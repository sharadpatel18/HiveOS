// app/dashboard/components/data/mock-data.ts

import {
  Users,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  UserPlus,
  CalendarCheck,
  Building2,
} from "lucide-react"

export const stats = [
  {
    label: "Total Employees",
    value: "24",
    change: "+2 this month",
    trend: "up" as const,
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Open Positions",
    value: "6",
    change: "3 interviews scheduled",
    trend: "neutral" as const,
    icon: Briefcase,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    label: "Active Tasks",
    value: "38",
    change: "12 due today",
    trend: "up" as const,
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Unread Messages",
    value: "9",
    change: "Across 4 channels",
    trend: "neutral" as const,
    icon: MessageSquare,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
]

export const recentActivity = [
  {
    user: "Arjun Mehta",
    avatar: "AM",
    action: "accepted your invite",
    role: "Recruiter",
    time: "2m ago",
    type: "invite" as const,
  },
  {
    user: "Priya Shah",
    avatar: "PS",
    action: "completed task",
    role: "Design Sprint Q1",
    time: "18m ago",
    type: "task" as const,
  },
  {
    user: "Dev Patel",
    avatar: "DP",
    action: "interview scheduled",
    role: "Frontend Engineer",
    time: "1h ago",
    type: "interview" as const,
  },
  {
    user: "Neha Joshi",
    avatar: "NJ",
    action: "joined the company",
    role: "Employee",
    time: "3h ago",
    type: "member" as const,
  },
  {
    user: "Rahul Verma",
    avatar: "RV",
    action: "created a new task",
    role: "API Integration",
    time: "5h ago",
    type: "task" as const,
  },
]

export const upcomingInterviews = [
  {
    candidate: "Siddharth Roy",
    avatar: "SR",
    role: "Backend Engineer",
    time: "Today, 3:00 PM",
    interviewer: "You",
    status: "confirmed" as const,
  },
  {
    candidate: "Ananya Kapoor",
    avatar: "AK",
    role: "Product Designer",
    time: "Tomorrow, 11:00 AM",
    interviewer: "Priya Shah",
    status: "pending" as const,
  },
  {
    candidate: "Karan Singh",
    avatar: "KS",
    role: "DevOps Engineer",
    time: "Feb 28, 2:30 PM",
    interviewer: "Arjun Mehta",
    status: "confirmed" as const,
  },
]

export const tasks = [
  { title: "Review Q1 hiring plan", priority: "high" as const, due: "Today", done: false },
  { title: "Onboard Neha Joshi", priority: "medium" as const, due: "Tomorrow", done: false },
  { title: "Update job description — Backend role", priority: "low" as const, due: "Feb 28", done: false },
  { title: "Send offer letter to Siddharth", priority: "high" as const, due: "Today", done: true },
  { title: "Team standup notes", priority: "low" as const, due: "Yesterday", done: true },
]

export const teamMembers = [
  { name: "Priya Shah", role: "Founder", avatar: "PS", status: "online" as const },
  { name: "Arjun Mehta", role: "Recruiter", avatar: "AM", status: "online" as const },
  { name: "Dev Patel", role: "Employee", avatar: "DP", status: "away" as const },
  { name: "Neha Joshi", role: "Employee", avatar: "NJ", status: "offline" as const },
]

export const activityIcon = {
  invite: <UserPlus className="h-3.5 w-3.5 text-blue-400" />,
  task: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
  interview: <CalendarCheck className="h-3.5 w-3.5 text-violet-400" />,
  member: <Building2 className="h-3.5 w-3.5 text-amber-400" />,
}

export const statusDot = {
  online: "bg-emerald-500",
  away: "bg-amber-400",
  offline: "bg-muted-foreground/30",
}

export const priorityBadge = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const