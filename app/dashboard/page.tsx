import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Users,
  Briefcase,
  MessageSquare,
  CalendarCheck,
  TrendingUp,
  Clock,
  MoreHorizontal,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  Building2,
  UserPlus,
} from "lucide-react"

// ── Mock Data ──────────────────────────────────────────────────────────────────

const stats = [
  {
    label: "Total Employees",
    value: "24",
    change: "+2 this month",
    trend: "up",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Open Positions",
    value: "6",
    change: "3 interviews scheduled",
    trend: "neutral",
    icon: Briefcase,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    label: "Active Tasks",
    value: "38",
    change: "12 due today",
    trend: "up",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Unread Messages",
    value: "9",
    change: "Across 4 channels",
    trend: "neutral",
    icon: MessageSquare,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
]

const recentActivity = [
  {
    user: "Arjun Mehta",
    avatar: "AM",
    action: "accepted your invite",
    role: "Recruiter",
    time: "2m ago",
    type: "invite",
  },
  {
    user: "Priya Shah",
    avatar: "PS",
    action: "completed task",
    role: "Design Sprint Q1",
    time: "18m ago",
    type: "task",
  },
  {
    user: "Dev Patel",
    avatar: "DP",
    action: "interview scheduled",
    role: "Frontend Engineer",
    time: "1h ago",
    type: "interview",
  },
  {
    user: "Neha Joshi",
    avatar: "NJ",
    action: "joined the company",
    role: "Employee",
    time: "3h ago",
    type: "member",
  },
  {
    user: "Rahul Verma",
    avatar: "RV",
    action: "created a new task",
    role: "API Integration",
    time: "5h ago",
    type: "task",
  },
]

const upcomingInterviews = [
  {
    candidate: "Siddharth Roy",
    avatar: "SR",
    role: "Backend Engineer",
    time: "Today, 3:00 PM",
    interviewer: "You",
    status: "confirmed",
  },
  {
    candidate: "Ananya Kapoor",
    avatar: "AK",
    role: "Product Designer",
    time: "Tomorrow, 11:00 AM",
    interviewer: "Priya Shah",
    status: "pending",
  },
  {
    candidate: "Karan Singh",
    avatar: "KS",
    role: "DevOps Engineer",
    time: "Feb 28, 2:30 PM",
    interviewer: "Arjun Mehta",
    status: "confirmed",
  },
]

const tasks = [
  { title: "Review Q1 hiring plan", priority: "high", due: "Today", done: false },
  { title: "Onboard Neha Joshi", priority: "medium", due: "Tomorrow", done: false },
  { title: "Update job description — Backend role", priority: "low", due: "Feb 28", done: false },
  { title: "Send offer letter to Siddharth", priority: "high", due: "Today", done: true },
  { title: "Team standup notes", priority: "low", due: "Yesterday", done: true },
]

const teamMembers = [
  { name: "Priya Shah", role: "Founder", avatar: "PS", status: "online" },
  { name: "Arjun Mehta", role: "Recruiter", avatar: "AM", status: "online" },
  { name: "Dev Patel", role: "Employee", avatar: "DP", status: "away" },
  { name: "Neha Joshi", role: "Employee", avatar: "NJ", status: "offline" },
]

const priorityColor: Record<string, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-emerald-500",
}

const priorityBadge: Record<string, string> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
}

const statusDot: Record<string, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-400",
  offline: "bg-muted-foreground/30",
}

const activityIcon: Record<string, React.ReactNode> = {
  invite: <UserPlus className="h-3.5 w-3.5 text-blue-400" />,
  task: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
  interview: <CalendarCheck className="h-3.5 w-3.5 text-violet-400" />,
  member: <Building2 className="h-3.5 w-3.5 text-amber-400" />,
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-4 px-4 md:py-6 lg:px-6">

              {/* ── Welcome bar ── */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Good morning, Priya 👋</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Here's what's happening at your company today.
                  </p>
                </div>
                <Button size="sm" className="gap-2 hidden sm:flex">
                  <Plus className="h-4 w-4" />
                  Quick Action
                </Button>
              </div>

              {/* ── Stat cards ── */}
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

              {/* ── Middle row ── */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                {/* Activity feed */}
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
                      {recentActivity.map((item, i) => (
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
                          <div className="mt-0.5">
                            {activityIcon[item.type]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Team members */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Team</CardTitle>
                      <Badge variant="secondary" className="text-xs">{teamMembers.length} members</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-4">
                    <div className="flex flex-col gap-3">
                      {teamMembers.map((member, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8 text-xs">
                              <AvatarFallback>{member.avatar}</AvatarFallback>
                            </Avatar>
                            <span
                              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${statusDot[member.status]}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Message {member.name}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-3" />
                    <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                      <UserPlus className="h-3.5 w-3.5" /> Invite Member
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* ── Bottom row ── */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                {/* Upcoming Interviews */}
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Upcoming Interviews</CardTitle>
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                        Schedule new <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="pl-6 text-xs">Candidate</TableHead>
                          <TableHead className="text-xs">Role</TableHead>
                          <TableHead className="text-xs">Time</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="pr-6 text-xs text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingInterviews.map((interview, i) => (
                          <TableRow key={i}>
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7 text-xs">
                                  <AvatarFallback>{interview.avatar}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{interview.candidate}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{interview.role}</TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{interview.time}</TableCell>
                            <TableCell>
                              <Badge
                                variant={interview.status === "confirmed" ? "default" : "secondary"}
                                className="text-xs capitalize"
                              >
                                {interview.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="pr-6 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View details</DropdownMenuItem>
                                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Tasks */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">My Tasks</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {tasks.filter((t) => !t.done).length} pending
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
                            variant={priorityBadge[task.priority] as any}
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

              </div>

              {/* ── Company health bar ── */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Company Overview</CardTitle>
                  <CardDescription>A quick snapshot of where things stand across HiveOS</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "Hiring pipeline filled", value: 68, color: "bg-blue-500" },
                      { label: "Tasks completed this week", value: 74, color: "bg-emerald-500" },
                      { label: "Team capacity utilized", value: 81, color: "bg-violet-500" },
                      { label: "Interview slots booked", value: 50, color: "bg-amber-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-semibold">{item.value}%</span>
                        </div>
                        <Progress value={item.value} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}