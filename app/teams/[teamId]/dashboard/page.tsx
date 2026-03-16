// app/teams/[teamId]/dashboard/components/team-dashboard-content.tsx
"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import TeamDashboard from "./components/team-dashboard"

interface TeamDashboardContentProps {
    teamId: string
}

export default function TeamDashboardContent({ teamId }: TeamDashboardContentProps) {
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
                        <TeamDashboard teamId={teamId} />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}