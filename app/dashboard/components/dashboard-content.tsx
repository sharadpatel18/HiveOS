// app/dashboard/components/dashboard-content.tsx
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { WelcomeSection } from "./welcome-section"
import { StatsGrid } from "./stats-grid"
import { ActivityFeed } from "./activity-feed"
import { TeamMembersCard } from "./team-member-card"
import { InterviewsTable } from "./interview-table"
import { TasksCard } from "./tasks-card"
import { CompanyOverview } from "./company-overview"
import { stats, recentActivity, teamMembers, upcomingInterviews, tasks } from "../data/mock-data"

export default function DashboardContent() {
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
                        <div className="flex flex-col gap-6 py-4 px-4 md:py-6 lg:px-6">

                            {/* Welcome Section */}
                            <WelcomeSection userName="Priya" />

                            {/* Stats Grid */}
                            <StatsGrid stats={stats} />

                            {/* Middle Row: Activity + Team */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <ActivityFeed activities={recentActivity} />
                                <TeamMembersCard members={teamMembers} />
                            </div>

                            {/* Bottom Row: Interviews + Tasks */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <InterviewsTable interviews={upcomingInterviews} />
                                <TasksCard tasks={tasks} />
                            </div>

                            {/* Company Overview */}
                            <CompanyOverview />

                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}