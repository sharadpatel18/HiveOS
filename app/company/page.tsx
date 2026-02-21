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
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CreateCompanyDialog from "@/components/create-company-dialog"
import { getCompanyByUserId } from "@/services/company-service"

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

// ─── API call ─────────────────────────────────────────────────────────────────

async function fetchCompany(): Promise<Company | null> {
    try {
        const res = await fetch("/api/company")
        if (!res.ok) return null
        const data = await res.json()
        return data.company ?? null
    } catch {
        return null
    }
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function CompanyLoadingSkeleton() {
    return (
        <div className="mx-auto max-w-5xl px-6 py-10 space-y-8 w-full animate-pulse">
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
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
        </div>
    )
}

// ─── No Company State (existing component) ────────────────────────────────────

function NoCompanyState() {
    return (
        <div className="mx-auto max-w-7xl px-6 py-16 space-y-16 w-full">
            {/* Header */}
            <div className="text-center space-y-6">
                <div className="mx-auto h-24 w-24 rounded-3xl border-2 border-dashed border-primary/40 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm shadow-lg shadow-primary/10 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
                    <Building2 className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-3">
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        Get Started
                    </Badge>
                    <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Create your company workspace
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Manage recruiters, post jobs, and control everything related to your
                        organization from one centralized platform.
                    </p>
                </div>
            </div>

            {/* Stats Preview */}
            <div className="grid gap-6 md:grid-cols-3">
                {[
                    { title: "Recruiters", icon: Users, description: "Team members", color: "from-blue-500/20 to-blue-500/5" },
                    { title: "Jobs Posted", icon: Briefcase, description: "Open positions", color: "from-purple-500/20 to-purple-500/5" },
                    { title: "Applications", icon: FileText, description: "Candidates", color: "from-emerald-500/20 to-emerald-500/5" },
                ].map((item, i) => (
                    <Card key={i} className="border-dashed border-2 hover:border-solid hover:border-primary/40 transition-all hover:shadow-lg group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
                                <CardDescription className="text-xs">{item.description}</CardDescription>
                            </div>
                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <item.icon className="h-6 w-6 text-foreground/70" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/50">0</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Features */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { icon: Shield, text: "Secure & Private" },
                    { icon: Zap, text: "Lightning Fast" },
                    { icon: Users, text: "Team Collaboration" },
                    { icon: TrendingUp, text: "Analytics Dashboard" },
                ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{feature.text}</span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-xl shadow-primary/10">
                <CardHeader className="text-center space-y-4 pb-6">
                    <Badge variant="secondary" className="mx-auto gap-1.5 px-4 py-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        Quick Setup
                    </Badge>
                    <div className="space-y-2">
                        <CardTitle className="text-4xl font-bold tracking-tight">
                            Create your company in minutes
                        </CardTitle>
                        <CardDescription className="text-base">
                            Become a founder and start hiring talented candidates instantly
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 pb-8">
                    <div className="grid gap-3 max-w-2xl mx-auto">
                        {[
                            { num: "1", title: "Create company profile", description: "Add your company details and branding", icon: Building2 },
                            { num: "2", title: "Get founder access", description: "Full control over your workspace", icon: Shield },
                            { num: "3", title: "Start hiring", description: "Post jobs and review applications", icon: Zap },
                        ].map((step) => (
                            <div key={step.num} className="flex items-center gap-4 p-5 rounded-2xl border-2 bg-card hover:bg-accent/50 hover:border-primary/40 transition-all group">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                    {step.num}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="font-semibold text-base">{step.title}</div>
                                    <div className="text-sm text-muted-foreground">{step.description}</div>
                                </div>
                                <step.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center">
                        <CreateCompanyDialog>
                            <Button size="lg" className="gap-2 text-base px-8 py-6 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105">
                                Create company
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </CreateCompanyDialog>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t">
                        {["Free to create", "No credit card required", "Setup in 2 minutes"].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Trust indicators */}
            <div className="text-center space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Trusted by innovative companies worldwide</p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Enterprise-grade security</span>
                    <span>•</span>
                    <span>GDPR compliant</span>
                    <span>•</span>
                    <span>99.9% uptime</span>
                </div>
            </div>
        </div>
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
        { label: "Recruiters", value: "—", icon: Users, color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-500" },
        { label: "Jobs Posted", value: "—", icon: Briefcase, color: "from-purple-500/20 to-purple-500/5", iconColor: "text-purple-500" },
        { label: "Applications", value: "—", icon: FileText, color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-500" },
        { label: "Activity", value: "—", icon: TrendingUp, color: "from-orange-500/20 to-orange-500/5", iconColor: "text-orange-500" },
    ]

    return (
        <div className="mx-auto max-w-5xl px-6 py-10 space-y-8 w-full">

            {/* Company Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-5">
                    <Avatar className="h-20 w-20 rounded-2xl border-2 border-border shadow-md">
                        <AvatarFallback className="rounded-2xl text-2xl font-bold bg-gradient-to-br from-primary/30 to-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
                            {company.isActive && (
                                <Badge variant="secondary" className="gap-1 text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                                    <BadgeCheck className="h-3.5 w-3.5" />
                                    Active
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                            {company.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            {company.industry && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Factory className="h-3.5 w-3.5" />
                                    {company.industry}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                {company.size} employees
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Founded {createdDate}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
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

            <Separator />

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`h-4.5 w-4.5 ${stat.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">No data yet</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Company Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Company Details</CardTitle>
                        <CardDescription>Overview of your organization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { label: "Founder", value: company.founder, icon: UserCircle },
                            { label: "Company Size", value: company.size, icon: Users },
                            { label: "Industry", value: company.industry ?? "Not specified", icon: Factory },
                            { label: "Website", value: company.website ?? "Not specified", icon: Globe, isLink: !!company.website },
                            { label: "Slug", value: `/${company.slug}`, icon: Activity },
                        ].map((detail, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
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
                                    <span className="text-sm font-medium">{detail.value}</span>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                { label: "Post a Job", icon: Briefcase, variant: "default" as const },
                                { label: "Invite Recruiter", icon: Users, variant: "outline" as const },
                                { label: "View Applications", icon: FileText, variant: "outline" as const },
                                { label: "Company Settings", icon: Settings, variant: "outline" as const },
                            ].map((action, i) => (
                                <Button key={i} variant={action.variant} className="w-full justify-start gap-2" size="sm">
                                    <action.icon className="h-4 w-4" />
                                    {action.label}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Status Card */}
                    <Card className="border-emerald-500/20 bg-emerald-500/5">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                        Company Active
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Your company is live and accepting applications
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompanyPage() {
    const [company, setCompany] = useState<Company | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getData = async () => {
            const res = await getCompanyByUserId();

            console.log(res[0]);

            setCompany(res[0]);
            setLoading(false);
        }

        getData();
    }, [])

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
                        {loading ? (
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