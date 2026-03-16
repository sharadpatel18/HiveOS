// app/dashboard/components/interviews-table.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus } from "lucide-react"

interface Interview {
    candidate: string
    avatar: string
    role: string
    time: string
    interviewer: string
    status: "confirmed" | "pending"
}

interface InterviewsTableProps {
    interviews: Interview[]
}

export function InterviewsTable({ interviews }: InterviewsTableProps) {
    return (
        <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Upcoming Interviews</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                        Schedule new <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-6 text-xs">Candidate</TableHead>
                            <TableHead className="text-xs">Role</TableHead>
                            <TableHead className="text-xs">Time</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="pr-6 text-xs text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {interviews.map((interview, i) => (
                            <TableRow key={i}>
                                <TableCell className="pl-6">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-7 w-7 text-xs">
                                            <AvatarFallback>{interview.avatar}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{interview.candidate}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {interview.role}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                    {interview.time}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={interview.status === "confirmed" ? "default" : "secondary"}
                                        className="text-xs capitalize"
                                    >
                                        {interview.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="pr-6 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View details</DropdownMenuItem>
                                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                Cancel
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}