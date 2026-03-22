// app/dashboard/components/team-members-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MessageSquare, UserPlus } from "lucide-react"
import { statusDot } from "../data/mock-data"

interface TeamMember {
    name: string
    role: string
    avatar: string
    status: "online" | "away" | "offline"
}

interface TeamMembersCardProps {
    members: TeamMember[]
}

export function TeamMembersCard({ members }: TeamMembersCardProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Team</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                        {members.length} members
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-4">
                <div className="flex flex-col gap-3">
                    {members.map((member, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-8 w-8 text-xs">
                                    <AvatarFallback>{member.avatar}</AvatarFallback>
                                </Avatar>
                                <span
                                    className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${statusDot[member.status]
                                        }`}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Message {member.name}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ))}
                </div>
                <Separator className="my-3" />
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                    <UserPlus className="h-3.5 w-3.5" /> Invite Member
                </Button>
            </CardContent>
        </Card>
    )
}