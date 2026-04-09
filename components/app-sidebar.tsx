"use client"

import * as React from "react"
import {
  IconBuilding,
  IconBriefcase,
  IconChartBar,
  IconDashboard,
  IconFileText,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconUsers,
  IconUserPlus,
  IconListCheck,
  IconUsersGroup,
  IconClipboardList,
  IconLayoutDashboard,
  IconChartPie,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useCompany } from "@/hooks/use-company"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Role } from "@/types/role"
import { usePathname } from "next/navigation"

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = Role

function getEffectiveRole(
  memberRole?: string,
  userRole?: string,
  companyUserId?: string,
  userId?: string,
): UserRole {
  if (companyUserId && userId && companyUserId === userId) return "FOUNDER"
  return (memberRole ?? userRole ?? "USER").toUpperCase() as UserRole
}

// ─── Role badge config ────────────────────────────────────────────────────────

const ROLE_META: Record<UserRole, { label: string; className: string }> = {
  FOUNDER: { label: "Founder", className: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  RECRUITER: { label: "Recruiter", className: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  EMPLOYEE: { label: "Employee", className: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  USER: { label: "Viewer", className: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
  MANAGER: { label: "Manager", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  TEAMLEAD: { label: "Team Lead", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  SUPERADMIN: { label: "Super Admin", className: "text-red-400 bg-red-500/10 border-red-500/20" },
}

// ─── Click-based active state (persisted) ─────────────────────────────────────

const STORAGE_KEY = "sidebar_active_nav"

function useActiveNav(defaultKey: string) {
  const pathname = usePathname()
  const [activeKey, setActiveKeyRaw] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) ?? defaultKey
    }
    return defaultKey
  })

  const setActiveKey = React.useCallback((key: string) => {
    setActiveKeyRaw(key)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, key)
    }
  }, [])

  // Auto-detect active key from pathname
  React.useEffect(() => {
    if (pathname.includes("/teams/") && pathname.includes("/dashboard")) {
      setActiveKey("team-dashboard")
    } else if (pathname.includes("/teams/") && pathname.includes("/members")) {
      setActiveKey("team-members")
    } else if (pathname.includes("/teams/") && pathname.includes("/settings")) {
      setActiveKey("team-settings")
    } else if (pathname.includes("/teams/") && pathname.includes("/analytics")) {
      setActiveKey("team-analytics")
    } else if (pathname === "/teams") {
      setActiveKey("teams")
    } else if (pathname === "/dashboard") {
      setActiveKey("dashboard")
    } else if (pathname.includes("/company/") && pathname.includes("/members")) {
      setActiveKey("members")
    } else if (pathname.includes("/company") && !pathname.includes("/members")) {
      setActiveKey("company")
    }
  }, [pathname, setActiveKey])

  return { activeKey, setActiveKey }
}

// ─── Extract Team ID from URL ─────────────────────────────────────────────────
function useTeamId() {
  const pathname = usePathname()
  const match = pathname.match(/\/teams\/([^\/]+)/)
  return match?.[1] ?? null
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isMount, setIsMount] = React.useState(false)
  const { data: session, status } = useSession()
  const user = session?.user
  const { data: company } = useCompany()
  const { activeKey, setActiveKey } = useActiveNav("dashboard")
  const teamId = useTeamId()

  const role = getEffectiveRole(
    company?.memberRole,
    user?.role,
    company?.userId,
    user?.id,
  )

  const isFounder = role === "FOUNDER"
  const isEmployee = role === "EMPLOYEE"
  const companyId = company?.id
  const roleMeta = ROLE_META[role] ?? ROLE_META.USER

  // ── 1. General nav ────────────────────────────────────────────────────────
  const navGeneral = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
      isActive: activeKey === "dashboard",
      onClick: () => setActiveKey("dashboard"),
    },
    {
      title: "Company",
      url: "/company",
      icon: IconBuilding,
      isActive: activeKey === "company",
      onClick: () => setActiveKey("company"),
    },
    {
      title: "Overview",
      url: "/company",
      icon: IconChartBar,
      isActive: activeKey === "overview",
      onClick: () => setActiveKey("overview"),
    },
  ]

  // ── 2. Members ────────────────────────────────────────────────────────────
  const navMembers = company && companyId
    ? [
      {
        title: "Members",
        url: `/company/${companyId}/members`,
        icon: IconUsers,
        isActive: activeKey === "members",
        onClick: () => setActiveKey("members"),
        disabled: role === "USER",
        disabledReason: "Join the company to view members",
      },
    ]
    : []

  // ── 3. Team Management ────────────────────────────────────────────────────
  const navTeams = company && companyId
    ? [
      {
        title: "All Teams",
        url: `/teams`,
        icon: IconUsersGroup,
        isActive: activeKey === "teams",
        onClick: () => setActiveKey("teams"),
        disabled: isEmployee || role === "USER",
        disabledReason: "Only founders and managers can view",
      },
    ]
    : []

  // ── 3a. Current Team Navigation (only show when inside a team) ────────────
  const navCurrentTeam = teamId
    ? [
      {
        title: "Team Dashboard",
        url: `/teams/${teamId}/dashboard`,
        icon: IconLayoutDashboard,
        isActive: activeKey === "team-dashboard",
        onClick: () => setActiveKey("team-dashboard"),
      },
      {
        title: "Team Tasks",
        url: `/teams/${teamId}/tasks`,
        icon: IconListCheck,
        isActive: activeKey === "team-tasks",
        onClick: () => setActiveKey("team-tasks"),
      },
      {
        title: "Team Analytics",
        url: `/teams/${teamId}/analytics`,
        icon: IconChartPie,
        isActive: activeKey === "team-analytics",
        onClick: () => setActiveKey("team-analytics"),
      },
      {
        title: "Team Settings",
        url: `/teams/${teamId}/settings`,
        icon: IconSettings,
        isActive: activeKey === "team-settings",
        onClick: () => setActiveKey("team-settings"),
        disabled: isEmployee || role === "USER",
        disabledReason: "Only team leads and above can access settings",
      },
    ]
    : []


  // ── Secondary nav ─────────────────────────────────────────────────────────
  const navSecondary = [
    {
      title: "Settings",
      url: companyId ? `/company/${companyId}/settings` : "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ]

  React.useEffect(() => {
    setIsMount(true)
  }, [])

  if (!isMount) return null

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* ── Header ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/dashboard" onClick={() => setActiveKey("dashboard")}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">HiveOS.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent>
        {/* General */}
        <NavMain items={navGeneral} label={
          <span className="flex items-center justify-between gap-2 w-full pr-1">
            <span className="truncate">General</span>
          </span>
        } showQuickCreate />

        {company && companyId ? (
          <>
            {/* Section 1 — Members */}
            <NavMain
              items={navMembers}
              label={
                <span className="flex items-center justify-between gap-2 w-full pr-1">
                  <span className="truncate">Members</span>
                  <Badge className={cn("text-[10px] h-4 px-1.5 font-medium shrink-0", roleMeta.className)}>
                    {roleMeta.label}
                  </Badge>
                </span>
              }
            />

            {/* Section 2 — Team Management */}
            <NavMain
              items={navTeams}
              label={
                <span className="flex items-center justify-between gap-2 w-full pr-1">
                  <span>Teams</span>
                </span>
              }
            />

            {/* Section 2a — Current Team (only when inside a team) */}
            {teamId && navCurrentTeam.length > 0 && (
              <NavMain
                items={navCurrentTeam}
                label={
                  <span className="flex items-center justify-between gap-2 w-full pr-1">
                    <span className="truncate">Current Team</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 shrink-0">
                      Active
                    </Badge>
                  </span>
                }
              />
            )}
          </>
        ) : (
          <>
            {/* General nav shown even without company */}

            <div className="px-3 py-2">
              <div className="px-3 py-3 rounded-lg border border-dashed border-sidebar-border bg-sidebar-accent/20 space-y-1.5">
                <p className="text-xs font-medium">No company yet</p>
                <p className="text-[11px] text-sidebar-foreground/50 leading-relaxed">
                  Create or join a company to unlock team features.
                </p>
                <Link
                  href="/company"
                  onClick={() => setActiveKey("company")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-sidebar-primary hover:underline"
                >
                  Get started →
                </Link>
              </div>
            </div>
          </>
        )}

        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter>
        <NavUser
          user={{
            id: user?.id ?? "",
            fullName: user?.fullName ?? "",      // ✅ NextAuth uses 'name' not 'fullName'
            email: user?.email ?? "",
            role: user?.role ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}