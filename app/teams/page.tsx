"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    Plus, Users, UserCog, Pencil, Trash2, UserPlus,
    Crown, ChevronRight, Calendar, Search, Link2,
    Building2, Globe, Briefcase, Users2, BadgeCheck,
    ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useCompany } from "@/hooks/use-company"
import Link from "next/link"
import { createTeam } from "@/services/teams-services"
import { cn } from "@/lib/utils"
import { useTeams } from "@/hooks/use-teams"
import type { Team } from "@/types/teams"
import { redirect } from "next/navigation"

// ─── Constants ────────────────────────────────────────────────────────────────
const CAN_CREATE_TEAM = ["FOUNDER", "MANAGER"]
const CAN_MANAGE_TEAM = ["FOUNDER", "MANAGER", "TEAM_LEAD"]

// ─── Types ────────────────────────────────────────────────────────────────────
type Member = {
    id: string
    userId: string
    fullName: string
    email: string
    role: string
    hiredBy: string | null
    joinedAt: string
    createdAt: string
}

type Company = {
    id: string
    name: string
    slug: string
    description: string
    size: string
    founder: string
    website: string
    industry: string
    isActive: boolean
    userId: string
    createdAt: string
    updatedAt: string
    memberRole: string
    members: Member[]
}



// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(value: string) {
    return value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

// ─── Company Banner ───────────────────────────────────────────────────────────
function CompanyBanner({ company }: { company: Company }) {
    return (
        <div className="rounded-xl border bg-card p-6 flex flex-col sm:flex-row gap-5 sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-2xl">
                {company.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-3 flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                    <h2 className="text-xl font-bold tracking-tight">{company.name}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="font-mono text-xs">/{company.slug}</Badge>
                        {company.isActive && (
                            <Badge className="gap-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0 text-xs">
                                <BadgeCheck className="w-3 h-3" /> Active
                            </Badge>
                        )}
                        <Badge variant="outline" className="capitalize text-xs gap-1">
                            <Crown className="w-3 h-3" />
                            {company.memberRole.replace("_", " ").toLowerCase()}
                        </Badge>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{company.description}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" />{company.founder}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />{company.industry}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Users2 className="w-3.5 h-3.5" />{company.size} employees
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Since {new Date(company.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                    {company.website && (
                        <Link href={company.website} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-primary hover:underline">
                            <Globe className="w-3.5 h-3.5" />
                            {company.website.replace(/^https?:\/\//, "")}
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

function CompanyBannerSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-6 flex gap-5">
            <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
            <div className="flex flex-col gap-3 flex-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-28" />
                </div>
            </div>
        </div>
    )
}

// ─── Create Team Dialog ───────────────────────────────────────────────────────
function CreateTeamDialog({ open, onOpenChange, onSubmit, members }: {
    open: boolean
    onOpenChange: (v: boolean) => void
    onSubmit: (data: { name: string; slug: string; description: string; personalTeam: boolean; teamleadId: string, companyId: string }) => Promise<void>
    members: Member[]
}) {
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [description, setDescription] = useState("")
    const [personalTeam, setPersonalTeam] = useState(false)
    const [teamleadId, setTeamleadId] = useState("")
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
    const [loading, setLoading] = useState(false)
    const { data: company } = useCompany()
    const teamLeads = members.filter((m) => m.role === "TEAMLEAD")

    function handleNameChange(value: string) {
        setName(value)
        if (!slugManuallyEdited) setSlug(slugify(value))
    }

    function handleClose() {
        setName(""); setSlug(""); setDescription("")
        setPersonalTeam(false); setSlugManuallyEdited(false); setTeamleadId("")
        onOpenChange(false)
    }

    async function handleSubmit() {
        if (!name.trim() || !slug.trim() || !teamleadId) return
        setLoading(true)
        try {
            await onSubmit({ name: name.trim(), slug, description: description.trim(), personalTeam, teamleadId, companyId: company?.id ?? "" })
            handleClose()
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" /> Create New Team
                    </DialogTitle>
                    <DialogDescription>Create a team to organize members and collaborate together.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Name */}
                    <div className="flex flex-col gap-2">
                        <Label>Team name <span className="text-destructive">*</span></Label>
                        <Input placeholder="e.g. Frontend Engineers" value={name} onChange={(e) => handleNameChange(e.target.value)} />
                    </div>

                    {/* Slug */}
                    <div className="flex flex-col gap-2">
                        <Label>Slug <span className="text-destructive">*</span>
                            <span className="text-xs text-muted-foreground ml-1">(URL identifier)</span>
                        </Label>
                        <div className="relative">
                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-9 font-mono text-sm" placeholder="frontend-engineers" value={slug}
                                onChange={(e) => { setSlugManuallyEdited(true); setSlug(slugify(e.target.value)) }} />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <Label>Description</Label>
                        <Textarea placeholder="What does this team work on?" value={description}
                            onChange={(e) => setDescription(e.target.value)} rows={3} />
                    </div>

                    {/* Team Lead */}
                    <div className="flex flex-col gap-2">
                        <Label>Team Lead <span className="text-destructive">*</span></Label>
                        {teamLeads.length === 0 ? (
                            <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                                <Users className="w-4 h-4 shrink-0" />
                                No team leads available. Assign a member the Team Lead role first.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto rounded-lg border p-2">
                                {teamLeads.map((lead) => (
                                    <button
                                        key={lead.id}
                                        type="button"
                                        onClick={() => setTeamleadId(lead.userId)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent",
                                            teamleadId === lead.userId && "bg-primary/10 ring-1 ring-primary/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                                            teamleadId === lead.userId
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {lead.fullName[0].toUpperCase()}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-sm font-medium truncate">{lead.fullName}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Joined {new Date(lead.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        </div>
                                        <Badge className="shrink-0 text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10">
                                            Team Lead
                                        </Badge>
                                        {teamleadId === lead.userId && (
                                            <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Personal Team */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">Personal team</span>
                            <span className="text-xs text-muted-foreground">A private 1-person workspace</span>
                        </div>
                        <Switch checked={personalTeam} onCheckedChange={setPersonalTeam} />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim() || !slug.trim() || !teamleadId || loading}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {loading ? "Creating..." : "Create Team"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Edit Team Dialog ─────────────────────────────────────────────────────────
function EditTeamDialog({ open, onOpenChange, team, onSubmit }: {
    open: boolean
    onOpenChange: (v: boolean) => void
    team: Team | null
    onSubmit: (id: string, data: { name: string; slug: string; description: string }) => Promise<void>
}) {
    const [name, setName] = useState(team?.name ?? "")
    const [slug, setSlug] = useState(team?.slug ?? "")
    const [description, setDescription] = useState(team?.description ?? "")
    const [loading, setLoading] = useState(false)

    async function handleSubmit() {
        if (!team || !name.trim() || !slug.trim()) return
        setLoading(true)
        try {
            await onSubmit(team.id, { name: name.trim(), slug, description: description.trim() })
            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="w-5 h-5" /> Edit Team
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-2">
                        <Label>Team name <span className="text-destructive">*</span></Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Slug <span className="text-destructive">*</span></Label>
                        <div className="relative">
                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-9 font-mono text-sm" value={slug}
                                onChange={(e) => setSlug(slugify(e.target.value))} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Description</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!name.trim() || !slug.trim() || loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Team Card ────────────────────────────────────────────────────────────────
function TeamCard({ team, canManage, onEdit, onDelete, onAddMember }: {
    team: Team
    canManage: boolean
    onEdit: (team: Team) => void
    onDelete: (team: Team) => void
    onAddMember: (team: Team) => void
    onClick?: () => void
}) {
    return (
        <div className="group relative flex flex-col gap-4 rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30" onClick={() => redirect(`/teams/${team.id}/dashboard`)}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm leading-tight truncate">{team.name}</p>
                            {team.personalTeam && (
                                <Badge variant="secondary" className="text-xs shrink-0">Personal</Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                            <Link2 className="w-3 h-3" />{team.slug}
                        </p>
                    </div>
                </div>

                {canManage && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <UserCog className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(team)} className="gap-2">
                                <Pencil className="w-4 h-4" /> Edit Team
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAddMember(team)} className="gap-2">
                                <UserPlus className="w-4 h-4" /> Add Member
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(team)}
                                className="gap-2 text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4" /> Delete Team
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {team.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{team.description}</p>
            )}

            <div className="flex items-center justify-end mt-auto pt-3 border-t">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
        </div>
    )
}

// ─── Teams Dashboard ──────────────────────────────────────────────────────────
function TeamsDashboard({ company, teams, loadingTeams }: {
    company: Company
    teams: Team[]
    loadingTeams: boolean
}) {
    const [createOpen, setCreateOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Team | null>(null)
    const [search, setSearch] = useState("")

    const canCreate = CAN_CREATE_TEAM.includes(company.memberRole)
    const canManage = CAN_MANAGE_TEAM.includes(company.memberRole)

    const filtered = teams.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase())
    )

    async function handleCreate(data: {
        name: string; slug: string; description: string
        personalTeam: boolean; teamleadId: string
        companyId: string
    }) {
        try {
            await createTeam(data)
            toast.success(`Team "${data.name}" created`)
        } catch {
            toast.error("Failed to create team")
        }
    }

    async function handleEdit(id: string, data: { name: string; slug: string; description: string }) {
        // TODO: await updateTeam({ id, ...data })
        toast.success("Team updated")
    }

    async function handleDelete(team: Team) {
        // TODO: await deleteTeam(team.id)
        toast.success(`Team "${team.name}" deleted`)
    }

    async function handleAddMember(team: Team) {
        // TODO: open add member dialog
        toast.info(`Add member to "${team.name}"`)
    }

    const handleRedirect = (team: Team) => {
        // TODO: redirect to team dashboard
        toast.info(`Redirect to "${team.name}" dashboard`)
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Company Banner */}
            <CompanyBanner company={company} />

            {/* Teams Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <h2 className="text-lg font-bold tracking-tight">Teams</h2>
                        <p className="text-xs text-muted-foreground">Organize members into focused groups</p>
                    </div>
                </div>
                {canCreate && (
                    <Button onClick={() => setCreateOpen(true)} className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" /> Create Team
                    </Button>
                )}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name or slug..." value={search}
                    onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            {/* Teams Grid */}
            {loadingTeams ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-44 rounded-xl border bg-muted/30 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <Users className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">No teams found</p>
                    <p className="text-sm text-muted-foreground">
                        {search
                            ? "Try a different search term."
                            : canCreate
                                ? "Create your first team to get started."
                                : "No teams have been created yet."}
                    </p>
                    {canCreate && !search && (
                        <Button onClick={() => setCreateOpen(true)} className="gap-2 mt-2">
                            <Plus className="w-4 h-4" /> Create Team
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((team) => (
                        <TeamCard
                            key={team.id}
                            team={team}
                            canManage={canManage}
                            onEdit={setEditTarget}
                            onDelete={handleDelete}
                            onAddMember={handleAddMember}
                            onClick={() => handleRedirect(team)}
                        />
                    ))}
                </div>
            )}

            <CreateTeamDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSubmit={handleCreate}
                members={company.members ?? []}
            />
            <EditTeamDialog
                open={!!editTarget}
                onOpenChange={(v) => !v && setEditTarget(null)}
                team={editTarget}
                onSubmit={handleEdit}
            />
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TeamsPage() {
    const { data: company, isLoading } = useCompany()

    // ✅ Use real data and loading state from useTeams hook
    const { data: teamList, isLoading: loadingTeams } = useTeams()
    const teams: Team[] = teamList ?? []
    console.log(teams)
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
                            <div className="flex flex-col gap-6 p-6">
                                <CompanyBannerSkeleton />
                            </div>
                        ) : company ? (
                            <TeamsDashboard
                                company={company}
                                teams={teams}
                                loadingTeams={loadingTeams}
                            />
                        ) : (
                            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                                No company found.
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}