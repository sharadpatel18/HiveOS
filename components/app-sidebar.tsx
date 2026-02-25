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
import { useAuthStore } from "@/store/auth-store"
import { useCompany } from "@/hooks/use-company"
import { cn } from "@/lib/utils"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = "FOUNDER" | "RECRUITER" | "EMPLOYEE" | "USER"

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
}

// ─── Click-based active state (persisted) ─────────────────────────────────────

const STORAGE_KEY = "sidebar_active_nav"

function useActiveNav(defaultKey: string) {
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

  return { activeKey, setActiveKey }
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)
  const { data: company } = useCompany()
  const { activeKey, setActiveKey } = useActiveNav("dashboard")

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

  // ── Nav data (same shape NavMain/NavSecondary/NavDocuments expect) ────────

  // General nav — always visible
  const navMain = [
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
  ]

  // Company-scoped nav — only when user belongs to a company
  // Items that are locked get a disabled flag so NavMain can render them dimmed
  const navCompany = company && companyId
    ? [
      {
        title: "Overview",
        url: "/company",
        icon: IconChartBar,
        isActive: activeKey === "overview",
        onClick: () => setActiveKey("overview"),
      },
      {
        title: "Members",
        url: `/company/${companyId}/members`,
        icon: IconUsers,
        isActive: activeKey === "members",
        onClick: () => setActiveKey("members"),
        disabled: role === "USER",
        disabledReason: "Join the company to view members",
      },
      {
        title: "Invite Members",
        url: `/company/${companyId}/members`,   // same page, different section
        icon: IconUserPlus,
        isActive: activeKey === "invite-members",
        onClick: () => setActiveKey("invite-members"),
        disabled: isEmployee || role === "USER",
        disabledReason: "Only founders and recruiters can invite",
      },
      {
        title: "Applications",
        url: `/company/${companyId}/applications`,
        icon: IconFileText,
        isActive: activeKey === "applications",
        onClick: () => setActiveKey("applications"),
        disabled: isEmployee || role === "USER",
        disabledReason: "Only founders and recruiters can view",
      },
      {
        title: "Post a Job",
        url: `/company/${companyId}/jobs/new`,
        icon: IconBriefcase,
        isActive: activeKey === "post-job",
        onClick: () => setActiveKey("post-job"),
        disabled: !isFounder,
        disabledReason: "Only founders can post jobs",
      },
      {
        title: "Settings",
        url: `/company/${companyId}/settings`,
        icon: IconSettings,
        isActive: activeKey === "settings",
        onClick: () => setActiveKey("settings"),
        disabled: !isFounder,
        disabledReason: "Only founders can access settings",
      },
    ]
    : []

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

  return (
    // ✅ Exact same Sidebar shell as original shadcn
    <Sidebar collapsible="offcanvas" {...props}>

      {/* ── Header — unchanged structure ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard" onClick={() => setActiveKey("dashboard")}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">GrowWithMe.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content — same structure, your data instead of placeholder ── */}
      <SidebarContent>

        {/* General nav — Dashboard + Company (Quick Create only here) */}
        <NavMain items={navMain} showQuickCreate />

        {/* Company nav — only renders when user has a company */}
        {company && companyId && (
          <NavMain
            items={navCompany}
            // Pass company name + role badge as the group label
            label={
              <span className="flex items-center justify-between gap-2 w-full pr-1">
                <span className="truncate">{company.name}</span>
                <Badge className={cn("text-[10px] h-4 px-1.5 font-medium shrink-0", roleMeta.className)}>
                  {roleMeta.label}
                </Badge>
              </span>
            }
          />
        )}

        {/* No company prompt — shown instead of company nav */}
        {!company && (
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
        )}

        {/* Secondary nav — Settings, Help, Search — pinned to bottom */}
        <NavSecondary items={navSecondary} className="mt-auto" />

      </SidebarContent>

      {/* ── Footer — unchanged structure ── */}
      <SidebarFooter>
        <NavUser
          user={
            user ?? {
              id: "",
              fullName: "",
              email: "",
              role: "",
            }
          }
        />
      </SidebarFooter>

    </Sidebar>
  )
}