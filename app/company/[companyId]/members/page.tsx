"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import { Users, UserCheck, Briefcase, Search, UserPlus, Crown, UserX, MoveRight, MailCheck } from "lucide-react"

import { inviteUserToCompany, searchUserByEmail } from "@/services/company-service"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"
import { useCompany } from "@/hooks/use-company"

interface Member {
    id: string
    fullName: string
    email: string
    role: "FOUNDER" | "RECRUITER" | "EMPLOYEE"
    joinedAt: string
}

const ROLE_COLORS: Record<string, string> = {
    FOUNDER: "bg-amber-100 text-amber-800 border-amber-200",
    RECRUITER: "bg-violet-100 text-violet-800 border-violet-200",
    EMPLOYEE: "bg-sky-100 text-sky-800 border-sky-200",
}

const AVATAR_COLORS = [
    "bg-rose-500",
    "bg-violet-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
]

function getAvatarColor(name: string) {
    const idx = name.charCodeAt(0) % AVATAR_COLORS.length
    return AVATAR_COLORS[idx]
}

// Roles that can be assigned based on the inviter's role
const ASSIGNABLE_ROLES: Record<string, { value: string; label: string }[]> = {
    FOUNDER: [
        { value: "RECRUITER", label: "Recruiter" },
        { value: "EMPLOYEE", label: "Employee" },
        { value: "MANAGER", label: "Manager" },
        { value: "TEAMLEAD", label: "Team Lead" },
    ],
    RECRUITER: [
        { value: "EMPLOYEE", label: "Employee" },
        { value: "MANAGER", label: "Manager" },
    ],
    MANAGER: [
        { value: "EMPLOYEE", label: "Employee" },
        { value: "TEAMLEAD", label: "Team Lead" },
    ],
    TEAMLEAD: [
        { value: "EMPLOYEE", label: "Employee" },
    ]
}

function InviteMemberDialog({
    open,
    onOpenChange,
    currentRole,
    companyId
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRole: string,
    companyId: string
}) {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("")
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [foundUser, setFoundUser] = useState<{ name: string; email: string } | null>(null)
    const [searched, setSearched] = useState(false)

    const assignableRoles = ASSIGNABLE_ROLES[currentRole] ?? []

    function handleClose() {
        setEmail("")
        setRole("")
        setFoundUser(null)
        setSearched(false)
        onOpenChange(false)
    }

    async function handleSearch() {
        if (!email) return
        setSearching(true)
        setSearched(false)
        setFoundUser(null)
        setRole("")
        try {
            const invitedUser = await searchUserByEmail(email)
            setFoundUser(invitedUser ?? null)
        } catch (err) {
            console.log("Failed to search user:", err)
        } finally {
            setSearching(false)
            setSearched(true)
        }
    }

    async function handleSubmit() {
        if (!foundUser || !role) return
        setLoading(true)
        try {
            await inviteUserToCompany({ companyId, email: foundUser.email, role })
            toast.success("Invitation sent successfully")
            handleClose()
        } catch (err) {
            console.log("Failed to invite member:", err)
            toast.error("Failed to send invitation")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Invite Member
                    </DialogTitle>
                    <DialogDescription>
                        Search for a user by email to invite them to your company.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-5 py-2">
                    {/* Email Search */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="invite-email">
                            Email address <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="invite-email"
                                type="email"
                                placeholder="member@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setFoundUser(null)
                                    setSearched(false)
                                }}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleSearch}
                                disabled={!email || searching}
                            >
                                {searching ? "Searching..." : "Search"}
                            </Button>
                        </div>
                    </div>

                    {/* User Not Found */}
                    {searched && !foundUser && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <UserX className="w-4 h-4" />
                            No user found with that email address.
                        </div>
                    )}

                    {/* Found User Card + Role Select */}
                    {foundUser && (
                        <>
                            <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/40">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                    {foundUser.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{foundUser.name}</span>
                                    <span className="text-xs text-muted-foreground">{foundUser.email}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="invite-role">
                                    Assign role <span className="text-destructive">*</span>
                                </Label>
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger id="invite-role" className="w-full">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assignableRoles.map((r) => (
                                            <SelectItem key={r.value} value={r.value}>
                                                <div className="flex items-center gap-2">
                                                    {r.value === "RECRUITER" ? (
                                                        <UserCheck className="w-4 h-4 text-violet-500" />
                                                    ) : (
                                                        <Briefcase className="w-4 h-4 text-sky-500" />
                                                    )}
                                                    {r.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!foundUser || !role || loading}
                        className="gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        {loading ? "Sending..." : "Send Invite"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
function StatCard({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: React.ElementType
    label: string
    value: number
    color: string
}) {
    return (
        <Card className="flex-1 min-w-[140px]">
            <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function MemberRowSkeleton() {
    return (
        <TableRow>
            {Array.from({ length: 4 }).map((_, i) => (
                <TableCell key={i}>
                    <Skeleton className="h-5 w-full rounded" />
                </TableCell>
            ))}
        </TableRow>
    )
}

function MembersTable({
    members,
    loading,
}: {
    members: Member[]
    loading: boolean
}) {
    const [search, setSearch] = useState("")

    const filtered = members.filter(
        (m) =>
            m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            m.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search members..."
                        className="pl-9 h-9 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-[260px] font-semibold text-foreground">
                                Member
                            </TableHead>
                            <TableHead className="font-semibold text-foreground">
                                Email
                            </TableHead>
                            <TableHead className="font-semibold text-foreground">
                                Role
                            </TableHead>
                            <TableHead className="font-semibold text-foreground">
                                Joined
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <MemberRowSkeleton key={i} />
                            ))
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center py-14 text-muted-foreground"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="w-8 h-8 opacity-30" />
                                        <p className="text-sm">No members found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((member) => (
                                <TableRow
                                    key={member.id}
                                    className="hover:bg-muted/30 transition-colors"
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border">
                                                <AvatarFallback
                                                    className={`text-white text-xs font-semibold ${getAvatarColor(
                                                        member.fullName
                                                    )}`}
                                                >
                                                    {member.fullName?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-sm">
                                                {member.fullName}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-sm text-muted-foreground">
                                        {member.email}
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs font-medium capitalize ${ROLE_COLORS[member.role?.toUpperCase()] ??
                                                "bg-gray-100 text-gray-800 border-gray-200"
                                                }`}
                                        >
                                            {member.role?.charAt(0).toUpperCase() +
                                                member.role?.slice(1).toLowerCase()}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(member.joinedAt).toLocaleDateString(
                                            "en-US",
                                            {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            }
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!loading && filtered.length > 0 && (
                <p className="text-xs text-muted-foreground px-1">
                    Showing {filtered.length} of {members.length} member
                    {members.length !== 1 ? "s" : ""}
                </p>
            )}
        </div>
    )
}

export default function MembersPage() {
    const params = useParams<{ companyId: string }>()
    const companyId = params.companyId
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [inviteOpen, setInviteOpen] = useState(false)
    const { data: company } = useCompany()
    const { user } = useAuthStore()
    const currentRole = user?.role?.toUpperCase()
    const isFounder = currentRole === "FOUNDER"
    const isRecruiter = currentRole === "RECRUITER"
    const isManager = currentRole === "MANAGER"
    const isTeamLead = currentRole === "TEAMLEAD"
    const canInvite = isFounder || isRecruiter || isManager || isTeamLead

    useEffect(() => {
        if (!companyId) return
        if (!company) return
        console.log(company.members)
        async function fetchMembers() {
            try {
                setMembers(company.members ?? [])
            } catch (err) {
                console.log("Failed to fetch members:", err)
                setMembers([])
            } finally {
                setLoading(false)
            }
        }

        fetchMembers()
    }, [companyId, company])

    const founders = members.filter((m) => m.role?.toUpperCase() === "FOUNDER")
    const recruiters = members.filter((m) => m.role?.toUpperCase() === "RECRUITER")
    const managers = members.filter((m) => m.role?.toUpperCase() === "MANAGER")
    const teamLeads = members.filter((m) => m.role?.toUpperCase() === "TEAMLEAD")
    const employees = members.filter((m) => m.role?.toUpperCase() === "EMPLOYEE")

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
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-6 py-8 px-4 lg:px-8 max-w-6xl mx-auto w-full">

                            {/* Page Header */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Team Management
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Manage your company members, roles, and access.
                                    </p>
                                </div>

                                {/* Founders and Recruiters can invite members */}
                                {canInvite && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={() => setInviteOpen(true)}
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    Invite Member
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Invite a new team member</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>

                            {/* Current User Role Badge */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Your role:</span>
                                <Badge
                                    variant="outline"
                                    className={`text-xs font-medium ${ROLE_COLORS[currentRole ?? ""] ??
                                        "bg-gray-100 text-gray-800 border-gray-200"
                                        }`}
                                >
                                    {currentRole
                                        ? currentRole.charAt(0) + currentRole.slice(1).toLowerCase()
                                        : "Unknown"}
                                </Badge>
                            </div>

                            {/* Stat Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <StatCard icon={Users} label="Total Members" value={loading ? 0 : members.length} color="bg-slate-500/10 text-slate-400" />
                                <StatCard icon={Crown} label="Founders" value={loading ? 0 : founders.length} color="bg-amber-500/10 text-amber-400" />
                                <StatCard icon={UserCheck} label="Recruiters" value={loading ? 0 : recruiters.length} color="bg-violet-500/10 text-violet-400" />
                                <StatCard icon={MoveRight} label="Managers" value={loading ? 0 : managers.length} color="bg-blue-500/10 text-blue-400" />
                                <StatCard icon={MailCheck} label="Team Leads" value={loading ? 0 : teamLeads.length} color="bg-emerald-500/10 text-emerald-400" />
                                <StatCard icon={Briefcase} label="Employees" value={loading ? 0 : employees.length} color="bg-sky-500/10 text-sky-400" />
                            </div>
                            <Separator />

                            {/* Tabs Card */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Members</CardTitle>
                                    <CardDescription>
                                        Browse and manage all team members by role.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="all">
                                        <TabsList className="mb-5">
                                            <TabsTrigger value="all" className="gap-1.5">
                                                <Users className="w-3.5 h-3.5" />
                                                All
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-1 h-5 min-w-[20px] px-1.5 text-xs"
                                                >
                                                    {loading ? "—" : members.length}
                                                </Badge>
                                            </TabsTrigger>
                                            <TabsTrigger value="founders" className="gap-1.5">
                                                <Crown className="w-3.5 h-3.5" />
                                                Founders
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-1 h-5 min-w-[20px] px-1.5 text-xs"
                                                >
                                                    {loading ? "—" : founders.length}
                                                </Badge>
                                            </TabsTrigger>
                                            <TabsTrigger value="recruiters" className="gap-1.5">
                                                <UserCheck className="w-3.5 h-3.5" />
                                                Recruiters
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-1 h-5 min-w-[20px] px-1.5 text-xs"
                                                >
                                                    {loading ? "—" : recruiters.length}
                                                </Badge>
                                            </TabsTrigger>
                                            <TabsTrigger value="manager">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                Manager
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-1 h-5 min-w-[20px] px-1.5 text-xs"
                                                >
                                                    {loading ? "—" : managers.length}
                                                </Badge>
                                            </TabsTrigger>
                                            <TabsTrigger value="teamleads">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                Team Leads
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-1 h-5 min-w-[20px] px-1.5 text-xs"
                                                >
                                                    {loading ? "—" : teamLeads.length}
                                                </Badge>
                                            </TabsTrigger>
                                            <TabsTrigger value="employees" className="gap-1.5">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                Employees
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-1 h-5 min-w-[20px] px-1.5 text-xs"
                                                >
                                                    {loading ? "—" : employees.length}
                                                </Badge>
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="all">
                                            <MembersTable members={members} loading={loading} />
                                        </TabsContent>

                                        <TabsContent value="founders">
                                            <MembersTable members={founders} loading={loading} />
                                        </TabsContent>

                                        <TabsContent value="recruiters">
                                            <MembersTable members={recruiters} loading={loading} />
                                        </TabsContent>

                                        <TabsContent value="manager">
                                            <MembersTable members={managers} loading={loading} />
                                        </TabsContent>

                                        <TabsContent value="teamleads">
                                            <MembersTable members={teamLeads} loading={loading} />
                                        </TabsContent>

                                        <TabsContent value="employees">
                                            <MembersTable members={employees} loading={loading} />
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                </div>

                {/* Invite Member Dialog */}
                {canInvite && currentRole && (
                    <InviteMemberDialog
                        open={inviteOpen}
                        onOpenChange={setInviteOpen}
                        currentRole={currentRole}
                        companyId={companyId}
                    />
                )}

            </SidebarInset>
        </SidebarProvider>
    )
}