"use client"

import { useState } from "react"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, MoreHorizontal, Trash2, Loader2 } from "lucide-react"
import {
    getRoleBadgeVariant, getRoleLabel, getInitials,
    canAddMembers, type Member, type MemberRole,
} from "@/types/teams"
import { AddMemberDialog } from "./add-member-dialog"

// ── Role hierarchy ────────────────────────────────────────────────────────────
const ROLE_LEVEL: Record<string, number> = {
    FOUNDER: 4,
    MANAGER: 3,
    TEAM_LEAD: 2,
    EMPLOYEE: 1,
}

function canActOnMember(actorRole: string | undefined, targetRole: string): boolean {
    const actorLevel = ROLE_LEVEL[actorRole ?? ""] ?? 0
    const targetLevel = ROLE_LEVEL[targetRole] ?? 0
    return actorLevel > targetLevel
}

// ── Three-dot row actions ─────────────────────────────────────────────────────
function MemberRowActions({
    member,
    actorRole,
    onRemove,
}: {
    member: Member
    actorRole: string | undefined
    onRemove: (memberId: string) => Promise<void>
}) {
    const [loading, setLoading] = useState(false)

    if (!canActOnMember(actorRole, member.role)) return null

    async function handleRemove() {
        setLoading(true)
        try {
            await onRemove(member.id)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Member actions</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                    onClick={handleRemove}
                    disabled={loading}
                    className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                >
                    {loading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                    }
                    Remove from Team
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// ── Main table ────────────────────────────────────────────────────────────────
interface TeamMembersTableProps {
    members: Member[]
    currentUserRole: string | undefined
    handleAddMember: (userId: string, role: MemberRole) => Promise<void>
    onRemoveMember: (memberId: string) => Promise<void>
}

export function TeamMembersTable({
    members,
    currentUserRole,
    handleAddMember,
    onRemoveMember,
}: TeamMembersTableProps) {
    const userCanAdd = canAddMembers(currentUserRole ?? "MEMBER")

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription className="mt-1">
                        {members.length} member{members.length !== 1 ? "s" : ""} in this team
                    </CardDescription>
                </div>

                {userCanAdd && <AddMemberDialog onAdd={handleAddMember} />}
            </CardHeader>

            <CardContent>
                {members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-3 text-muted-foreground">
                        <Users className="h-8 w-8 opacity-30" />
                        <p className="text-sm">No members in this team yet.</p>
                        {userCanAdd && (
                            <p className="text-xs">Use the button above to add the first member.</p>
                        )}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(member.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{member.name.trim()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {member.email}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleBadgeVariant(member.role)}>
                                            {getRoleLabel(member.role)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <MemberRowActions
                                            member={member}
                                            actorRole={currentUserRole}
                                            onRemove={onRemoveMember}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}