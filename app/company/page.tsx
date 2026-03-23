"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Building2, Users, Briefcase, FileText, TrendingUp,
    Sparkles, Shield, ArrowRight, CheckCircle2, Globe,
    Factory, UserCircle, Calendar, ExternalLink, Settings,
    MoreHorizontal, Activity, BadgeCheck, PlusCircle,
    UserPlus, ClipboardList, ChevronRight, Crown, User,
    XCircle, Link2,
} from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CreateCompanyDialog from "@/app/company/components/create-company-dialog"
import { useCompany } from "@/hooks/use-company"
import { useAuthStore } from "@/store/auth-store"
import Link from "next/link"
import { Role } from "@/types/role"
import { useState } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

type Company = {
    id: string
    name: string
    slug: string
    description: string
    size: string
    founder: string
    website?: string | null
    industry?: string | null
    isActive: boolean
    userId: string
    createdAt: string
    updatedAt: string
    memberRole: string
}

type UserRole = Role

// ─── Role Config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, {
    label: string
    badgeClass: string
    stripClass: string
    dotClass: string
    icon: React.ElementType
    description: string
}> = {
    FOUNDER: {
        label: "Founder",
        badgeClass: "text-violet-400 bg-violet-500/10 border-violet-500/20",
        stripClass: "bg-violet-500",
        dotClass: "bg-violet-500",
        icon: Crown,
        description: "Full access — manage everything",
    },
    RECRUITER: {
        label: "Recruiter",
        badgeClass: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        stripClass: "bg-blue-500",
        dotClass: "bg-blue-500",
        icon: UserPlus,
        description: "Invite employees & review applications",
    },
    EMPLOYEE: {
        label: "Employee",
        badgeClass: "text-slate-400 bg-slate-500/10 border-slate-500/20",
        stripClass: "bg-slate-500",
        dotClass: "bg-slate-500",
        icon: User,
        description: "View-only access to company details",
    },
    MANAGER: {
        label: "Manager",
        badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        stripClass: "bg-amber-500",
        dotClass: "bg-amber-500",
        icon: UserPlus,
        description: "Invite employees & review applications",
    },
    TEAMLEAD: {
        label: "Team Lead",
        badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        stripClass: "bg-amber-500",
        dotClass: "bg-amber-500",
        icon: UserPlus,
        description: "Invite employees & review applications",
    },
    USER: {
        label: "Viewer",
        badgeClass: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
        stripClass: "bg-zinc-500",
        dotClass: "bg-zinc-500",
        icon: User,
        description: "Public viewer",
    },
}

// ─── Permissions ──────────────────────────────────────────────────────────────

function usePermissions(company: Company | null | undefined) {
    const user = useAuthStore((s) => s.user)
    const rawRole = user?.role.toUpperCase() as UserRole
    const isFounder = rawRole === "FOUNDER" || company?.userId === user?.id
    const isRecruiter = !isFounder && rawRole === "RECRUITER"
    const isManager = !isFounder && !isRecruiter && rawRole === "MANAGER"
    const isTeamLead = !isFounder && !isRecruiter && rawRole === "TEAMLEAD"
    const isEmployee = !isFounder && !isRecruiter && rawRole === "EMPLOYEE"
    const effectiveRole: UserRole = isFounder ? "FOUNDER" : isRecruiter ? "RECRUITER" : isManager ? "MANAGER" : isTeamLead ? "TEAMLEAD" : isEmployee ? "EMPLOYEE" : "USER"

    return {
        role: effectiveRole,
        roleConfig: ROLE_CONFIG[effectiveRole] ?? ROLE_CONFIG.USER,
        isFounder, isRecruiter, isEmployee,
        canPostJob: isFounder,
        canInviteRecruiter: isFounder,
        canInviteEmployee: isFounder || isRecruiter || isManager || isTeamLead,
        canViewApplications: isFounder || isRecruiter,
        canManageSettings: isFounder,
        canEditCompany: isFounder,
        canManageRecruiters: isFounder,
    }
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function CompanyLoadingSkeleton() {
    return (
        <div className="mx-auto max-w-5xl w-full px-6 py-8 space-y-5">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3.5 w-64" />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
            <div className="grid lg:grid-cols-3 gap-4">
                <Skeleton className="h-56 rounded-xl lg:col-span-2" />
                <div className="space-y-3">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-36 rounded-xl" />
                </div>
            </div>
        </div>
    )
}

// ─── No Company State ─────────────────────────────────────────────────────────

function NoCompanyState() {
    const [open, setOpen] = useState(false)

    const handleDialog = (value: boolean) => {
        setOpen(value)
    }
    return (
        <div className="mx-auto max-w-lg px-6 py-24 text-center space-y-6 w-full">
            <div className="mx-auto h-14 w-14 rounded-2xl border border-dashed border-primary/30 flex items-center justify-center bg-primary/5">
                <Building2 className="h-7 w-7 text-primary/60" />
            </div>
            <div className="space-y-2">
                <Badge variant="secondary" className="gap-1.5 px-3 py-0.5 text-xs mb-1">
                    <Sparkles className="h-3 w-3" /> Get Started
                </Badge>
                <h1 className="text-2xl font-bold tracking-tight">Create your company</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Manage recruiters, post jobs, and control your organization from one place.
                </p>
            </div>
            <CreateCompanyDialog open={open} setOpen={handleDialog}>
                <Button size="sm" className="gap-2 px-6" onClick={() => setOpen(true)}>
                    Create company <ArrowRight className="h-3.5 w-3.5" />
                </Button>
            </CreateCompanyDialog>
            <div className="grid gap-2 sm:grid-cols-3 pt-2">
                {[
                    { icon: Shield, text: "Secure", desc: "Enterprise security" },
                    { icon: Users, text: "Team", desc: "Invite & manage" },
                    { icon: TrendingUp, text: "Analytics", desc: "Track performance" },
                ].map((f, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-card text-center">
                        <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center">
                            <f.icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <p className="font-semibold text-xs">{f.text}</p>
                        <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Stat Card — fixed layout ─────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconBg, iconColor }: {
    label: string; value: number
    icon: React.ElementType; iconBg: string; iconColor: string
}) {
    return (
        <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
            {/* top row: label + icon */}
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <div className={`h-7 w-7 rounded-lg ${iconBg} flex items-center justify-center`}>
                    <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                </div>
            </div>
            {/* bottom: value */}
            <div>
                <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                    {value === 0 ? "No data yet" : "Total"}
                </p>
            </div>
        </div>
    )
}

// ─── Quick Action Button ──────────────────────────────────────────────────────

function QuickActionButton({
    icon: Icon, label, href, description,
    variant = "outline", accent,
    disabled = false, disabledReason,
}: {
    icon: React.ElementType; label: string; description: string; href: string
    variant?: "default" | "outline"; accent?: string
    disabled?: boolean; disabledReason?: string
}) {
    const inner = (
        <div
            title={disabled ? disabledReason : undefined}
            className={[
                "group flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left w-full",
                disabled
                    ? "border-border/50 bg-muted/20 opacity-40 cursor-not-allowed"
                    : variant === "default"
                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 hover:-translate-y-px cursor-pointer"
                        : "border-border bg-card hover:border-primary/25 hover:bg-accent/40 hover:-translate-y-px hover:shadow-sm cursor-pointer"
            ].join(" ")}
        >
            <div className={[
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                disabled ? "bg-muted" : variant === "default" ? "bg-white/15" : accent ?? "bg-muted",
            ].join(" ")}>
                <Icon className={`h-4 w-4 ${disabled ? "text-muted-foreground" : variant === "default" ? "text-primary-foreground" : "text-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-xs leading-tight ${disabled ? "text-muted-foreground" : variant === "default" ? "text-primary-foreground" : "text-foreground"}`}>
                    {label}
                </p>
                <p className={`text-[11px] mt-0.5 truncate ${disabled ? "text-muted-foreground/50" : variant === "default" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {disabled ? (disabledReason ?? description) : description}
                </p>
            </div>
            {!disabled && (
                <ChevronRight className={`h-3.5 w-3.5 shrink-0 opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all ${variant === "default" ? "text-primary-foreground" : ""}`} />
            )}
        </div>
    )
    return disabled ? inner : <Link href={href}>{inner}</Link>
}

// ─── Company Dashboard ────────────────────────────────────────────────────────

function CompanyDashboard({ company }: { company: Company }) {
    const perms = usePermissions(company)
    const user = useAuthStore((s) => s.user)

    const companyInitials = company.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    const userInitials = user?.fullName
        ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() ?? "U"

    const createdDate = new Date(company.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })

    const { roleConfig } = perms
    const RoleIcon = roleConfig.icon

    const stats = [
        { label: "Recruiters", value: 0, icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-400" },
        { label: "Jobs Posted", value: 0, icon: Briefcase, iconBg: "bg-violet-500/10", iconColor: "text-violet-400" },
        { label: "Applications", value: 0, icon: FileText, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400" },
        { label: "Activity", value: 0, icon: TrendingUp, iconBg: "bg-orange-500/10", iconColor: "text-orange-400" },
    ]

    const quickActions = [
        {
            icon: PlusCircle, label: "Post a Job", description: "New listing",
            href: `/company/${company.id}/jobs/new`, variant: "default" as const,
            disabled: !perms.canPostJob, disabledReason: "Founders only",
        },
        {
            icon: UserPlus,
            label: perms.isFounder ? "Invite Member" : "Invite Employee",
            description: perms.isFounder ? "Recruiter or employee" : "Add an employee",
            href: `/company/${company.id}/members/invite`, accent: "bg-violet-500/10",
            disabled: !perms.canInviteEmployee, disabledReason: "No invite access",
        },
        {
            icon: ClipboardList, label: "Applications", description: "Review candidates",
            href: `/company/${company.id}/applications`, accent: "bg-emerald-500/10",
            disabled: !perms.canViewApplications, disabledReason: "No access",
        },
        {
            icon: Settings, label: "Settings", description: "Manage company",
            href: `/company/${company.id}/settings`, accent: "bg-slate-500/10",
            disabled: !perms.canManageSettings, disabledReason: "Founders only",
        },
    ]

    // Company details — only rows with actual data
    const companyDetails: { label: string; value: string; icon: React.ElementType; isLink?: boolean }[] = [
        { label: "Founder", value: company.founder || "—", icon: UserCircle },
        { label: "Size", value: company.size || "—", icon: Users },
        { label: "Industry", value: company.industry || "—", icon: Factory },
        ...(company.website ? [{ label: "Website", value: company.website, icon: Globe, isLink: true }] : []),
        { label: "Slug", value: `/${company.slug}`, icon: Link2 },
    ]

    const permissions = [
        { label: "Post jobs", allowed: perms.canPostJob },
        { label: "Invite recruiters", allowed: perms.canInviteRecruiter },
        { label: "Invite employees", allowed: perms.canInviteEmployee },
        { label: "View applications", allowed: perms.canViewApplications },
        { label: "Company settings", allowed: perms.canManageSettings },
    ]

    return (
        <div className="mx-auto max-w-5xl px-6 py-8 space-y-5 w-full">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3.5">
                    <Avatar className="h-12 w-12 rounded-xl border border-border shadow-sm shrink-0">
                        <AvatarFallback className="rounded-xl text-base font-bold bg-muted text-foreground">
                            {companyInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-lg font-bold tracking-tight">{company.name}</h1>
                            {company.isActive && (
                                <Badge className="gap-1 text-[11px] h-5 px-1.5 text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-medium">
                                    <BadgeCheck className="h-2.5 w-2.5" /> Active
                                </Badge>
                            )}
                            <Badge className={`gap-1 text-[11px] h-5 px-1.5 font-medium ${roleConfig.badgeClass}`}>
                                <RoleIcon className="h-2.5 w-2.5" /> {user?.role}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground max-w-lg line-clamp-1">
                            {company.description || "No description provided."}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            {company.industry && (
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Factory className="h-2.5 w-2.5" />{company.industry}
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Users className="h-2.5 w-2.5" />{company.size} employees
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Calendar className="h-2.5 w-2.5" />Since {createdDate}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {company.website && (
                        <Button variant="outline" size="sm" asChild className="h-7 text-xs gap-1.5 px-3">
                            <a href={company.website} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-3 w-3" /> Website
                                <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                            </a>
                        </Button>
                    )}
                    {(perms.canEditCompany || perms.canManageRecruiters) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {perms.canEditCompany && (
                                    <DropdownMenuItem className="gap-2 text-xs">
                                        <Settings className="h-3.5 w-3.5" /> Edit Company
                                    </DropdownMenuItem>
                                )}
                                {perms.canManageRecruiters && (
                                    <DropdownMenuItem className="gap-2 text-xs">
                                        <UserCircle className="h-3.5 w-3.5" /> Manage Recruiters
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* ── Stats ──────────────────────────────────────────────────── */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* ── Quick Actions ───────────────────────────────────────────── */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Quick Actions
                    </p>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    {quickActions.map((a, i) => <QuickActionButton key={i} {...a} />)}
                </div>

                {(perms.isEmployee || perms.isRecruiter) && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] ${perms.isEmployee
                        ? "bg-muted/40 border text-muted-foreground"
                        : "bg-blue-500/5 border border-blue-500/15 text-muted-foreground"
                        }`}>
                        {perms.isEmployee ? <Shield className="h-3 w-3 shrink-0" /> : <BadgeCheck className="h-3 w-3 shrink-0 text-blue-400" />}
                        {perms.isEmployee
                            ? <span>You have <strong className="text-foreground">employee</strong> access — view only. Contact your founder or recruiter to change this.</span>
                            : <span>You have <strong className="text-foreground">recruiter</strong> access. You can invite employees and review applications.</span>
                        }
                    </div>
                )}
            </div>

            {/* ── Bottom grid ────────────────────────────────────────────── */}
            <div className="grid gap-4 lg:grid-cols-3">

                {/* Left — Company Info + Details together */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Company details — compact rows, no empty space */}
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold">Company Details</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Overview of your organization</p>
                            </div>
                        </div>
                        <div className="divide-y">
                            {companyDetails.map((d, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <d.icon className="h-3.5 w-3.5 shrink-0" />
                                        {d.label}
                                    </div>
                                    {d.isLink ? (
                                        <a
                                            href={d.value}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                        >
                                            {d.value}
                                            <ExternalLink className="h-2.5 w-2.5" />
                                        </a>
                                    ) : (
                                        <span className="text-xs font-semibold text-foreground">{d.value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* At a glance — horizontal row instead of big card */}
                    <div className="rounded-xl border bg-card px-4 py-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                            At a Glance
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "Open Positions", value: 0, icon: Briefcase },
                                { label: "Pending Reviews", value: 0, icon: ClipboardList },
                                { label: "Team Members", value: 0, icon: Users },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30">
                                    <div className="h-7 w-7 rounded-md bg-background flex items-center justify-center border shrink-0">
                                        <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold leading-none">{item.value}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-3">

                    {/* Company status */}
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-emerald-400 leading-tight">Company Active</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Live · accepting applications</p>
                        </div>
                    </div>

                    {/* Your Profile card — self-contained, no overflow */}
                    <div className="rounded-xl border bg-card overflow-hidden">
                        {/* role color strip */}
                        <div className={`h-0.5 w-full ${roleConfig.stripClass}`} />
                        <div className="px-4 pt-3 pb-4 space-y-3.5">

                            {/* header */}
                            <div>
                                <p className="text-sm font-semibold">Your Profile</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Your presence in this company</p>
                            </div>

                            {/* user row */}
                            <div className="flex items-center gap-2.5">
                                <Avatar className="h-9 w-9 rounded-lg border border-border shrink-0">
                                    <AvatarFallback className="rounded-lg text-xs font-bold bg-muted">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate leading-tight">{user?.fullName}</p>
                                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
                                </div>
                                <Badge className={`gap-1 text-[11px] h-5 px-2 font-medium shrink-0 ${roleConfig.badgeClass}`}>
                                    <RoleIcon className="h-2.5 w-2.5" />
                                    {roleConfig.label}
                                </Badge>
                            </div>

                            {/* divider */}
                            <div className="border-t" />

                            {/* permissions */}
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                    Permissions
                                </p>
                                {permissions.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className={`text-[11px] ${p.allowed ? "text-foreground" : "text-muted-foreground/60"}`}>
                                            {p.label}
                                        </span>
                                        {p.allowed
                                            ? <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                            : <XCircle className="h-3 w-3 text-muted-foreground/25 shrink-0" />
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompanyPage() {
    const { data: company, isLoading } = useCompany()

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col">
                        {isLoading ? (
                            <CompanyLoadingSkeleton />
                        ) : company ? (
                            <CompanyDashboard company={company} />
                        ) : (
                            <NoCompanyState />
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}