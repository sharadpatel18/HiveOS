"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCompany } from "@/hooks/use-company"
import { useAuthStore } from "@/store/auth-store"
import { ModeToggle } from "./theme-button"
import {
  Bell,
  Building2,
  CheckCheck,
  Crown,
  LogOut,
  Settings,
  User,
  UserPlus,
  Briefcase,
  Info,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Page title map ───────────────────────────────────────────────────────────

function usePageTitle() {
  const pathname = usePathname()
  const routes: { pattern: RegExp; title: string }[] = [
    { pattern: /^\/dashboard$/, title: "Dashboard" },
    { pattern: /^\/company$/, title: "Company" },
    { pattern: /\/members\/invite/, title: "Invite Members" },
    { pattern: /\/members/, title: "Members" },
    { pattern: /\/applications/, title: "Applications" },
    { pattern: /\/jobs\/new/, title: "Post a Job" },
    { pattern: /\/jobs/, title: "Jobs" },
    { pattern: /\/settings/, title: "Settings" },
  ]
  return routes.find((r) => r.pattern.test(pathname))?.title ?? "Dashboard"
}

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  FOUNDER: { label: "Founder", className: "text-violet-400 bg-violet-500/10 border-violet-500/20", icon: Crown },
  RECRUITER: { label: "Recruiter", className: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: UserPlus },
  EMPLOYEE: { label: "Employee", className: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: User },
  USER: { label: "Viewer", className: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", icon: User },
  MANAGER: { label: "Manager", className: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: User },
  TEAMLEAD: { label: "Team Lead", className: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: User },
  SUPERADMIN: { label: "Super Admin", className: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: User },
}

// ─── Notifications ────────────────────────────────────────────────────────────

type Notification = {
  id: string
  type: "invite" | "application" | "job" | "info"
  title: string
  body: string
  time: string
  read: boolean
}

// Replace with your real API data when ready
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "invite", title: "New member joined", body: "Rahul Sharma accepted your recruiter invite.", time: "2m ago", read: false },
  { id: "2", type: "application", title: "New application", body: "Someone applied for the Frontend Developer role.", time: "1h ago", read: false },
  { id: "3", type: "job", title: "Job posted", body: "Your \"UI Designer\" listing is now live.", time: "3h ago", read: true },
]

const NOTIF_ICON: Record<Notification["type"], React.ElementType> = {
  invite: UserPlus, application: User, job: Briefcase, info: Info,
}
const NOTIF_COLOR: Record<Notification["type"], string> = {
  invite: "bg-violet-500/10 text-violet-400",
  application: "bg-emerald-500/10 text-emerald-400",
  job: "bg-blue-500/10 text-blue-400",
  info: "bg-zinc-500/10 text-zinc-400",
}

function NotificationsBell() {
  const [notifications, setNotifications] = React.useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [open, setOpen] = React.useState(false)
  const unread = notifications.filter((n) => !n.read).length

  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-[11px] text-muted-foreground">{unread > 0 ? `${unread} unread` : "All caught up"}</p>
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5 text-muted-foreground" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <div className="divide-y max-h-72 overflow-y-auto">
          {notifications.map((n) => {
            const Icon = NOTIF_ICON[n.type]
            return (
              <button key={n.id} onClick={() => markRead(n.id)}
                className={cn("w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors", !n.read && "bg-accent/20")}
              >
                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", NOTIF_COLOR[n.type])}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold truncate">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                </div>
                {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
              </button>
            )
          })}
        </div>
        <div className="border-t px-4 py-2">
          <Button variant="ghost" size="sm" className="w-full h-7 text-xs text-muted-foreground gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── User dropdown ────────────────────────────────────────────────────────────

function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
          <Avatar className="h-7 w-7 rounded-lg">
            <AvatarFallback className="rounded-lg text-[11px] font-bold bg-muted">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-52 rounded-xl">
        <DropdownMenuLabel className="pb-1">
          <p className="text-sm font-semibold truncate">{user?.fullName ?? "User"}</p>
          <p className="text-[11px] text-muted-foreground font-normal truncate">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
          <Link href="/profile"><User className="h-3.5 w-3.5" /> Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
          <Link href="/settings"><Settings className="h-3.5 w-3.5" /> Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
          onClick={() => logout?.()}
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Site Header — keeps exact shadcn structure ───────────────────────────────

export function SiteHeader() {
  const { data: company, isLoading } = useCompany()
  const user = useAuthStore((s) => s.user)
  const pageTitle = usePageTitle()

  // Derive role for the company badge
  const rawRole = (company?.memberRole ?? user?.role ?? "USER").toUpperCase()
  const isFounder = company?.userId === user?.id || rawRole === "FOUNDER"
  const effectiveRole = isFounder ? "FOUNDER" : rawRole
  const roleConf = ROLE_CONFIG[effectiveRole] ?? ROLE_CONFIG.USER
  const RoleIcon = roleConf.icon

  return (
    // ✅ Exact same outer shell as shadcn — nothing changed here
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">

        {/* ── Left: sidebar trigger + separator + dynamic page title ── */}
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{pageTitle}</h1>

        {/* ── Right: all actions ── */}
        <div className="ml-auto flex items-center gap-2">

          {/* Company badge — replaces the GitHub link */}
          {!isLoading && company && (
            <Link href="/company" className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium truncate max-w-28">{company.name}</span>
              <Badge className={cn("text-[10px] h-4 px-1.5 gap-0.5 font-medium", roleConf.className)}>
                <RoleIcon className="h-2.5 w-2.5" />
                {roleConf.label}
              </Badge>
            </Link>
          )}

          {/* Create company CTA — shown when no company */}
          {!isLoading && !company && (
            <Button variant="outline" size="sm" asChild className="hidden sm:flex h-8 text-xs gap-1.5">
              <Link href="/company">
                <Building2 className="h-3.5 w-3.5" /> Create Company
              </Link>
            </Button>
          )}

          {/* Theme toggle */}
          <ModeToggle />

          {/* Notifications */}
          <NotificationsBell />

          {/* User avatar + dropdown */}
          <UserMenu />

        </div>
      </div>
    </header>
  )
}