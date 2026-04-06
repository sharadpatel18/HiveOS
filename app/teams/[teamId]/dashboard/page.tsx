"use client"

import { addTeamMember, deleteTeamMembers } from "@/services/teams-services"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TeamHeader } from "./components/team-header"
import { TeamStats } from "./components/team-stats"
import { TeamMembersTable } from "./components/team-members-table"
import { TeamInfoCard } from "./components/team-info-card"
import { TeamDashboardSkeleton } from "./components/team-dashboard-skeleton"
import { type MemberRole } from "@/types/teams"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTeamsDetails } from "@/hooks/use-teams"

export default function TeamDashboardPage() {
    const teamId = useParams().teamId as string
    const { data: session } = useSession()
    const router = useRouter()
    const user = session?.user

    // ✅ called at top level — not inside a callback
    const { data: team, isLoading, error, refetch } = useTeamsDetails(teamId)

    const teamLeadsCount =
        team?.members.filter((m: any) => m.role.toUpperCase() === "TEAMLEAD").length ?? 0

    const currentUserRole = user?.role

    async function handleAddMember(userId: string, role: MemberRole) {
        try {
            await addTeamMember({ teamId, userId, role })
            refetch() // ← instead of fetchTeam()
        } catch {
            toast.error("Failed to add member. Please try again.")
        }
    }

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

                            {isLoading ? (
                                <TeamDashboardSkeleton />
                            ) : error ? (
                                <div className="flex items-center justify-center py-20">
                                    <p className="text-sm text-destructive">
                                        Something went wrong while fetching the team.
                                    </p>
                                </div>
                            ) : team ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <TeamHeader
                                            name={team.name}
                                            description={team.description}
                                            slug={team.slug}
                                            personalTeam={team.personalTeam}
                                            createdAt={team.createdAt}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 shrink-0"
                                            onClick={() => router.push(`/teams/${teamId}/tasks`)}
                                        >
                                            <ClipboardList className="size-4" />
                                            View Tasks
                                        </Button>
                                    </div>

                                    <TeamStats
                                        totalMembers={team.members.length}
                                        teamLeadsCount={teamLeadsCount}
                                        createdAt={team.createdAt}
                                    />

                                    <div className="grid gap-4 lg:grid-cols-3">
                                        <div className="lg:col-span-2">
                                            {user && (
                                                <TeamMembersTable
                                                    members={team.members}
                                                    currentUserRole={currentUserRole}
                                                    handleAddMember={handleAddMember}
                                                    onRemoveMember={async (memberId) => {
                                                        await deleteTeamMembers(memberId)
                                                        refetch()
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <TeamInfoCard
                                            teamleadId={team.teamleadId}
                                            members={team.members}
                                            companyId={team.companyId}
                                            updatedAt={team.updatedAt}
                                        />
                                    </div>
                                </>
                            ) : null}

                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}