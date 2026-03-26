"use client"

import { getTeamsById, addTeamMember, deleteTeamMembers } from "@/services/teams-services"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
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

interface TeamMember {
    id: string
    name: string
    email: string
    role: string
}

interface Team {
    id: string
    name: string
    slug: string
    description: string
    teamleadId: string
    companyId: string
    personalTeam: boolean
    createdAt: string
    updatedAt: string
    members: TeamMember[]
    success: boolean
}

export default function TeamDashboardPage() {
    const teamId = useParams().teamId as string
    const { data: session, status } = useSession()
    const user = session?.user
    const [team, setTeam] = useState<Team | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTeam = useCallback(async () => {
        try {
            setLoading(true)
            const res = await getTeamsById(teamId)
            if (res?.success) {
                setTeam(res)
            } else {
                setError("Team not found or failed to load.")
            }
        } catch {
            setError("Something went wrong while fetching the team.")
        } finally {
            setLoading(false)
        }
    }, [teamId])

    useEffect(() => {
        if (teamId) fetchTeam()
    }, [teamId, fetchTeam])

    const teamLeadsCount =
        team?.members.filter((m) => m.role.toUpperCase() === "TEAMLEAD").length ?? 0

    // Derive current user's role in this team
    const currentUserRole = user?.role

    async function handleAddMember(userId: string, role: MemberRole) {
        try {
            await addTeamMember({ teamId, userId, role })
            await fetchTeam()
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

                            {loading ? (
                                <TeamDashboardSkeleton />
                            ) : error ? (
                                <div className="flex items-center justify-center py-20">
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            ) : team ? (
                                <>
                                    {/* Team Header */}
                                    <TeamHeader
                                        name={team.name}
                                        description={team.description}
                                        slug={team.slug}
                                        personalTeam={team.personalTeam}
                                        createdAt={team.createdAt}
                                    />

                                    {/* Stats Grid */}
                                    <TeamStats
                                        totalMembers={team.members.length}
                                        teamLeadsCount={teamLeadsCount}
                                        createdAt={team.createdAt}
                                    />

                                    {/* Main Content Row */}
                                    <div className="grid gap-4 lg:grid-cols-3">
                                        {/* Members Table — Add button lives inside the card header */}
                                        <div className="lg:col-span-2">
                                            {
                                                user && (
                                                    <TeamMembersTable
                                                        members={team.members}
                                                        currentUserRole={currentUserRole}
                                                        handleAddMember={handleAddMember}
                                                        onRemoveMember={async (memberId) => {
                                                            // your API call here
                                                            await deleteTeamMembers(memberId)
                                                        }}
                                                    />
                                                )
                                            }
                                        </div>

                                        {/* Info Card */}
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