import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import CreateCompanyDialog from "@/components/create-company-dialog"

export default function CompanyPage() {
    // Simulate DB result
    const company = null // change to object when company exists

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
                        {!company ? (
                            <div className="mx-auto max-w-7xl px-6 py-16 space-y-16 w-full">
                                {/* HEADER - Enhanced with gradient and better spacing */}
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

                                {/* STATS PREVIEW - Enhanced with gradients and hover effects */}
                                <div className="grid gap-6 md:grid-cols-3">
                                    {[
                                        {
                                            title: "Recruiters",
                                            icon: Users,
                                            description: "Team members",
                                            color: "from-blue-500/20 to-blue-500/5"
                                        },
                                        {
                                            title: "Jobs Posted",
                                            icon: Briefcase,
                                            description: "Open positions",
                                            color: "from-purple-500/20 to-purple-500/5"
                                        },
                                        {
                                            title: "Applications",
                                            icon: FileText,
                                            description: "Candidates",
                                            color: "from-emerald-500/20 to-emerald-500/5"
                                        },
                                    ].map((item, i) => (
                                        <Card
                                            key={i}
                                            className="border-dashed border-2 hover:border-solid hover:border-primary/40 transition-all hover:shadow-lg group"
                                        >
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-sm font-semibold">
                                                        {item.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        {item.description}
                                                    </CardDescription>
                                                </div>
                                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    <item.icon className="h-6 w-6 text-foreground/70" />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-4xl font-bold text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/50">
                                                    0
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* FEATURES GRID - New section */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {[
                                        { icon: Shield, text: "Secure & Private" },
                                        { icon: Zap, text: "Lightning Fast" },
                                        { icon: Users, text: "Team Collaboration" },
                                        { icon: TrendingUp, text: "Analytics Dashboard" },
                                    ].map((feature, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <feature.icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="font-medium text-sm">{feature.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA - Enhanced with better visual hierarchy */}
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
                                                {
                                                    num: "1",
                                                    title: "Create company profile",
                                                    description: "Add your company details and branding",
                                                    icon: Building2
                                                },
                                                {
                                                    num: "2",
                                                    title: "Get founder access",
                                                    description: "Full control over your workspace",
                                                    icon: Shield
                                                },
                                                {
                                                    num: "3",
                                                    title: "Start hiring",
                                                    description: "Post jobs and review applications",
                                                    icon: Zap
                                                },
                                            ].map((step) => (
                                                <div
                                                    key={step.num}
                                                    className="flex items-center gap-4 p-5 rounded-2xl border-2 bg-card hover:bg-accent/50 hover:border-primary/40 transition-all group"
                                                >
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

                                        {/* BUTTON + DIALOG - Enhanced */}
                                        <div className="flex justify-center">
                                            <CreateCompanyDialog>
                                                <Button
                                                    size="lg"
                                                    className="gap-2 text-base px-8 py-6 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105"
                                                >
                                                    Create company
                                                    <ArrowRight className="h-5 w-5" />
                                                </Button>
                                            </CreateCompanyDialog>
                                        </div>

                                        {/* Benefits list */}
                                        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t">
                                            {[
                                                "Free to create",
                                                "No credit card required",
                                                "Setup in 2 minutes",
                                            ].map((benefit, i) => (
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
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Trusted by innovative companies worldwide
                                    </p>
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
                        ) : (
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                                {/* When company exists, show company dashboard */}
                                <h2 className="text-2xl font-bold">Company Dashboard</h2>
                                {/* Add your company dashboard components here */}
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}