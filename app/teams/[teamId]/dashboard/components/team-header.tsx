// app/teams/[teamId]/dashboard/_components/team-header.tsx
"use client"

import {
    Crown,
    Globe,
    Lock,
    MoreHorizontal,
    Plus,
    Settings,
    Share2,
    UserPlus,
    Users,
    Archive,
    LogOut,
    Copy,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { TeamDetails } from "./team-dashboard"

interface TeamHeaderProps {
    team: TeamDetails
    onInviteMember: () => void
    onCreateTask: () => void
}

export function TeamHeader({ team, onInviteMember, onCreateTask }: TeamHeaderProps) {
    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()

    return (
        <div className="space-y-4">
            {/* Top Row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                            {team.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
                                <Badge variant={team.visibility === "private" ? "secondary" : "outline"} className="gap-1">
                                    {team.visibility === "private" ? (
                                        <Lock className="h-3 w-3" />
                                    ) : (
                                        <Globe className="h-3 w-3" />
                                    )}
                                    {team.visibility}
                                </Badge>
                                <Badge variant="outline">{team.department}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                                {team.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button onClick={onCreateTask} size="sm" className="gap-1.5">
                        <Plus className="h-4 w-4" />
                        New Task
                    </Button>
                    <Button onClick={onInviteMember} variant="outline" size="sm" className="gap-1.5">
                        <UserPlus className="h-4 w-4" />
                        Invite
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="gap-2">
                                <Share2 className="h-4 w-4" />
                                Share Team
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                                <Copy className="h-4 w-4" />
                                Copy Invite Link
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                                <Settings className="h-4 w-4" />
                                Team Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2">
                                <Archive className="h-4 w-4" />
                                Archive Team
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive">
                                <LogOut className="h-4 w-4" />
                                Leave Team
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Separator />

            {/* Bottom Info Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {/* Team Lead */}
                <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span>Lead:</span>
                    <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={team.lead.avatar} />
                            <AvatarFallback className="text-[10px]">
                                {getInitials(team.lead.name)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{team.lead.name}</span>
                    </div>
                </div>

                <Separator orientation="vertical" className="h-4" />

                {/* Members Count + Avatars */}
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{team.membersCount} members</span>
                    <TooltipProvider>
                        <div className="flex -space-x-2">
                            {team.members.slice(0, 5).map((member) => (
                                <Tooltip key={member.id}>
                                    <TooltipTrigger asChild>
                                        <Avatar className="h-6 w-6 border-2 border-background cursor-pointer">
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback className="text-[10px]">
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.role.replace("_", " ")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                            {team.membersCount > 5 && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
                                    +{team.membersCount - 5}
                                </div>
                            )}
                        </div>
                    </TooltipProvider>
                </div>

                <Separator orientation="vertical" className="h-4" />

                <span>Created {new Date(team.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
        </div>
    )
}