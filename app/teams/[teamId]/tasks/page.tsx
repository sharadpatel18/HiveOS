"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TasksContent } from "./components/tasks-content"
import { useParams } from "next/navigation"

export default function TasksPage() {
    const params = useParams();
    const teamId = params.teamId as string
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
                        <TasksContent teamId={teamId} />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}