// app/teams/[teamId]/dashboard/_components/members-list.tsx
"use client"

import {
    Crown,
    Eye,
    MoreHorizontal,
    Shield,
    UserPlus,
    Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TeamMember } from "./team-dashboard"

interface MembersListProps {
    members: TeamMember[]
    onInvite: () => void
    compact?: boolean
}

const ROLE_CONFIG = {
    team_lead: {
        label: "Team Lead",
        icon: Crown,
        color: "text-yellow-600",
        badgeVariant: "default" as const,
    },
    member: {
        label: "Member",
        icon: Shield,
        color: "text-blue-600",
        badgeVariant: "secondary" as const,
    },
    viewer: {
        label: "Viewer",
        icon: Eye,
        color: "text-slate-500",
        badgeVariant: "outline" as const,
    },
}

const STATUS_CONFIG = {
    online: { label: "Online", dot: "bg-green-500" },
    away: { label: "Away", dot: "bg-yellow-500" },
    offline: { label: "Offline", dot: "bg-slate-300" },
}

export function MembersList({ members, onInvite, compact = false }: MembersListProps) {
    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase()

    // Compact view for Overview tab
    if (compact) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Team Members
                            <Badge variant="secondary" className="ml-1">
                                {members.length}
                            </Badge>
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={onInvite}>
                            <UserPlus className="h-3.5 w-3.5" />
                            Invite
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {members.slice(0, 5).map((member) => {
                        const roleConfig = ROLE_CONFIG[member.role]
                        const statusConfig = STATUS_CONFIG[member.status]

                        return (
                            <div key={member.id} className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2.5">
                                    <div className="relative">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback className="text-xs">
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${statusConfig.dot}`}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-none">{member.name}</p>
                                        <p className="text-[11px] text-muted-foreground">{roleConfig.label}</p>
                                    </div>
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                    {member.tasksCompleted} done
                                </div>
                            </div>
                        )
                    })}
                    {members.length > 5 && (
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                            View all {members.length} members
                        </Button>
                    )}
                </CardContent>
            </Card>
        )
    }

    // Full view
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Team Members
                        <Badge variant="secondary">{members.length}</Badge>
                    </CardTitle>
                    <Button onClick={onInvite} size="sm" className="gap-1.5">
                        <UserPlus className="h-4 w-4" />
                        Invite Member
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Tasks Done</TableHead>
                            <TableHead className="text-center">Pending</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => {
                            const roleConfig = ROLE_CONFIG[member.role]
                            const statusConfig = STATUS_CONFIG[member.status]
                            const RoleIcon = roleConfig.icon

                            return (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={member.avatar} />
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(member.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${statusConfig.dot}`}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={roleConfig.badgeVariant} className="gap-1">
                                            <RoleIcon className="h-3 w-3" />
                                            {roleConfig.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
                                            <span className="text-sm">{statusConfig.label}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {member.tasksCompleted}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={member.tasksPending > 5 ? "destructive" : "secondary"}>
                                            {member.tasksPending}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(member.joinedAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                <DropdownMenuItem>View Tasks</DropdownMenuItem>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuRadioGroup value={member.role}>
                                                            <DropdownMenuRadioItem value="team_lead">
                                                                Team Lead
                                                            </DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="member">
                                                                Member
                                                            </DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="viewer">
                                                                Viewer
                                                            </DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    Remove from Team
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}