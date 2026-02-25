"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Building2,
    Users,
    Briefcase,
    FileText,
    TrendingUp,
    Sparkles,
    Zap,
    Shield,
    ArrowRight,
    CheckCircle2,
    Globe,
    Factory,
    UserCircle,
    Calendar,
    ExternalLink,
    Settings,
    MoreHorizontal,
    Activity,
    BadgeCheck,
    PlusCircle,
    UserPlus,
    ClipboardList,
    ChevronRight,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CreateCompanyDialog from "@/components/create-company-dialog"
import { useCompany } from "@/hooks/use-company"
import Link from "next/link"

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
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function CompanyLoadingSkeleton() {
    return (
        <div className="mx-auto max-w-5xl px-6 py-10 space-y-8 w-full">
            <div className="flex items-start gap-6">
                <Skeleton className="h-20 w-20 rounded-2xl" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <Skeleton className="h-80 rounded-xl lg:col-span-2" />
                <Skeleton className="h-80 rounded-xl" />
            </div>
        </div>
    )
}

// ─── No Company State ─────────────────────────────────────────────────────────

function NoCompanyState() {
    return (
        <div className="mx-auto max-w-5xl px-6 py-16 space-y-12 w-full">
            <div className="text-center space-y-5">
                <div className="mx-auto h-20 w-20 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5">
                    <Building2 className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        Get Started
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight">
                        Create your company workspace
                    </h1>
                    <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Manage recruiters, post jobs, and control everything related to your
                        organization from one centralized platform.
                    </p>
                </div>
                <CreateCompanyDialog>
                    <Button size="lg" className="gap-2 px-8">
                        Create company
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </CreateCompanyDialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { icon: Shield, text: "Secure & Private", desc: "Enterprise-grade security" },
                    { icon: Users, text: "Team Collaboration", desc: "Invite and manage recruiters" },
                    { icon: TrendingUp, text: "Analytics", desc: "Track hiring performance" },
                ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl border bg-card">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <f.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{f.text}</p>
                            <p className="text-xs text-muted-foreground">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Quick Action Button ──────────────────────────────────────────────────────

function QuickActionButton({
    icon: Icon,
    label,
    company,
    description,
    variant = "outline",
    accent,
}: {
    icon: React.ElementType
    label: string
    description: string
    company: Company
    variant?: "default" | "outline"
    accent?: string
}) {
    return (
        <Link
            href={`/company/${company.id}/members`}
            className={`
                group w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left
                transition-all duration-200
                ${variant === "default"
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
                    : "border-border bg-card hover:border-primary/40 hover:bg-accent/40 hover:-translate-y-0.5 hover:shadow-md"
                }
            `}
        >
            <div className={`
                h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110
                ${variant === "default" ? "bg-primary-foreground/20" : accent ?? "bg-muted"}
            `}>
                <Icon className={`h-5 w-5 ${variant === "default" ? "text-primary-foreground" : "text-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${variant === "default" ? "text-primary-foreground" : "text-foreground"}`}>
                    {label}
                </p>
                <p className={`text-xs mt-0.5 truncate ${variant === "default" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {description}
                </p>
            </div>
            <ChevronRight className={`h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 ${variant === "default" ? "text-primary-foreground" : ""}`} />
        </Link>
    )
}

// ─── Company Dashboard ────────────────────────────────────────────────────────

function CompanyDashboard({ company }: { company: Company }) {
    const initials = company.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    const createdDate = new Date(company.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    })

    const stats = [
        {
            label: "Recruiters",
            value: 0,
            icon: Users,
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500",
        },
        {
            label: "Jobs Posted",
            value: 0,
            icon: Briefcase,
            iconBg: "bg-violet-500/10",
            iconColor: "text-violet-500",
        },
        {
            label: "Applications",
            value: 0,
            icon: FileText,
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-500",
        },
        {
            label: "Activity",
            value: 0,
            icon: TrendingUp,
            iconBg: "bg-orange-500/10",
            iconColor: "text-orange-500",
        },
    ]

    const companyDetails = [
        { label: "Founder", value: company.founder || "Not specified", icon: UserCircle },
        { label: "Company Size", value: company.size || "Not specified", icon: Users },
        { label: "Industry", value: company.industry || "Not specified", icon: Factory },
        {
            label: "Website",
            value: company.website || "Not specified",
            icon: Globe,
            isLink: !!company.website,
        },
        { label: "Slug", value: `/${company.slug}`, icon: Activity },
    ]

    return (
        <div className="mx-auto max-w-5xl px-6 py-10 space-y-8 w-full">

            {/* ── Company Header ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-5">
                    <Avatar className="h-20 w-20 rounded-2xl border-2 border-border shadow-sm shrink-0">
                        <AvatarFallback className="rounded-2xl text-2xl font-bold bg-muted text-foreground">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
                            {company.isActive && (
                                <Badge className="gap-1 text-emerald-700 bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/15">
                                    <BadgeCheck className="h-3.5 w-3.5" />
                                    Active
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                            {company.description || "No description provided."}
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            {company.industry && (
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Factory className="h-3.5 w-3.5" />
                                    {company.industry}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                {company.size} employees
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Founded {createdDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {company.website && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                                <Globe className="h-4 w-4" />
                                Website
                                <ExternalLink className="h-3 w-3 opacity-60" />
                            </a>
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                                <Settings className="h-4 w-4" />
                                Edit Company
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                                <UserCircle className="h-4 w-4" />
                                Manage Recruiters
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                                <div className={`h-8 w-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {stat.value === 0 ? "No data yet" : "Total"}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── Quick Actions (PRIMARY FEATURE) ── */}
            <div className="space-y-3">
                <div>
                    <h2 className="text-lg font-bold tracking-tight">Quick Actions</h2>
                    <p className="text-sm text-muted-foreground">Everything you need, one click away</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <QuickActionButton
                        icon={PlusCircle}
                        label="Post a Job"
                        company={company}
                        description="Create a new job listing"
                        variant="default"
                    />
                    <QuickActionButton
                        icon={UserPlus}
                        company={company}
                        label="Invite Recruiter"
                        description="Add team members"
                        accent="bg-violet-500/10"
                    />
                    <QuickActionButton
                        icon={ClipboardList}
                        company={company}
                        label="View Applications"
                        description="Review candidates"
                        accent="bg-emerald-500/10"
                    />
                    <QuickActionButton
                        icon={Settings}
                        company={company}
                        label="Company Settings"
                        description="Manage preferences"
                        accent="bg-slate-500/10"
                    />
                </div>
            </div>

            <Separator />

            {/* ── Bottom Section: Details + Status ── */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Company Details */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Company Details</CardTitle>
                        <CardDescription>Overview of your organization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {companyDetails.map((detail, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between py-2.5 border-b last:border-0"
                            >
                                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                    <detail.icon className="h-4 w-4 shrink-0" />
                                    {detail.label}
                                </div>
                                {detail.isLink ? (
                                    <a
                                        href={detail.value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                    >
                                        {detail.value}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                ) : (
                                    <span className="text-sm font-semibold">{detail.value}</span>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Status + Info */}
                <div className="space-y-4">
                    {/* Active Status */}
                    <Card className="border-emerald-500/25 bg-emerald-500/5">
                        <CardContent className="pt-5 pb-5">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                                        Company Active
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                        Your company is live and accepting applications
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">At a Glance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { label: "Open Positions", value: 0, icon: Briefcase },
                                { label: "Pending Reviews", value: 0, icon: ClipboardList },
                                { label: "Team Members", value: 0, icon: Users },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <item.icon className="h-3.5 w-3.5" />
                                        {item.label}
                                    </div>
                                    <Badge variant="secondary" className="font-bold tabular-nums">
                                        {item.value}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompanyPage() {
    const { data: company, isLoading } = useCompany()

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