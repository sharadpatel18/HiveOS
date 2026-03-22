"use client"

import { useState, useEffect, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Search, Loader2, X, AlertCircle } from "lucide-react"
import { ASSIGNABLE_ROLES, getRoleLabel, getInitials, type MemberRole } from "@/types/teams"
import { useParams } from "next/navigation"

interface CompanyUser {
    id: string
    name: string
    email: string
    role: string
}

interface AddMemberDialogProps {
    onAdd: (userId: string, role: MemberRole) => Promise<void>
    trigger?: React.ReactNode
}

export function AddMemberDialog({ onAdd, trigger }: AddMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const teamId = useParams().teamId as string
    // Search state
    const [email, setEmail] = useState("")
    const [searchResults, setSearchResults] = useState<CompanyUser[]>([])
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Selected user + role
    const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null)
    const [role, setRole] = useState<MemberRole>("EMPLOYEE")

    // Submit state
    const [loading, setLoading] = useState(false)

    // Debounced search — fires 400ms after user stops typing
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        const query = email.trim()

        if (!query || query.length < 2) {
            setSearchResults([])
            setShowDropdown(false)
            setSearchError(null)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true)
            setSearchError(null)
            try {
                const res = await fetch(`/api/teams/members?email=${encodeURIComponent(query)}&teamId=${teamId}`)
                const data = await res.json()

                if (!res.ok) {
                    setSearchError(data.message ?? "Search failed.")
                    setSearchResults([])
                } else {
                    setSearchResults(data.users ?? data ?? [])
                    setShowDropdown(true)
                }
            } catch {
                setSearchError("Could not reach the server. Try again.")
                setSearchResults([])
            } finally {
                setSearching(false)
            }
        }, 400)

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [email])

    function handleSelectUser(user: CompanyUser) {
        setSelectedUser(user)
        setEmail(user.email)
        setShowDropdown(false)
        setSearchResults([])
    }

    function handleClearUser() {
        setSelectedUser(null)
        setEmail("")
        setSearchResults([])
        setShowDropdown(false)
    }

    async function handleSubmit() {
        if (!selectedUser) return
        setLoading(true)
        try {
            await onAdd(selectedUser.id, selectedUser.role as MemberRole)
            resetAndClose()
        } finally {
            setLoading(false)
        }
    }

    function resetAndClose() {
        setOpen(false)
        setEmail("")
        setSelectedUser(null)
        setRole("EMPLOYEE")
        setSearchResults([])
        setShowDropdown(false)
        setSearchError(null)
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true) }}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add Member
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Search for a member from your company and assign them a role.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">

                    {/* Email search field */}
                    <div className="grid gap-2">
                        <Label htmlFor="search-email">Search by Email</Label>

                        <div className="relative">
                            {/* Left icon: spinner while searching, search icon otherwise */}
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                                {searching
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <Search className="h-4 w-4" />
                                }
                            </div>

                            <Input
                                id="search-email"
                                placeholder="e.g. priya@company.com"
                                value={email}
                                disabled={!!selectedUser}
                                className="pl-9 pr-9"
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (selectedUser) setSelectedUser(null)
                                }}
                                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true) }}
                            />

                            {/* Clear button when a user is selected or text is typed */}
                            {(email || selectedUser) && (
                                <button
                                    type="button"
                                    onClick={handleClearUser}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Search error */}
                        {searchError && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {searchError}
                            </p>
                        )}

                        {/* Search results dropdown */}
                        {showDropdown && searchResults.length > 0 && !selectedUser && (
                            <div className="border rounded-md bg-popover shadow-md overflow-hidden">
                                {searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleSelectUser(user)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left"
                                    >
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        <Badge variant="secondary" className="text-xs shrink-0">
                                            {user.role}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* No results state */}
                        {showDropdown && !searching && searchResults.length === 0 && email.length >= 2 && !selectedUser && (
                            <p className="text-xs text-muted-foreground px-1">
                                No users found in your company matching this email.
                            </p>
                        )}
                    </div>

                    {/* Selected user preview card */}
                    {selectedUser && (
                        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                            <Avatar className="h-9 w-9 shrink-0">
                                <AvatarFallback className="text-xs">
                                    {getInitials(selectedUser.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{selectedUser.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">Selected</Badge>
                        </div>
                    )}

                    {/* Role selector — only shown once a user is selected */}
                    {selectedUser && (
                        <div className="grid gap-2">
                            <Label htmlFor="add-role">Team Role</Label>
                            <Select disabled={true} value={selectedUser.role} onValueChange={(v) => setRole(selectedUser.role as MemberRole)}>
                                <SelectTrigger id="add-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ASSIGNABLE_ROLES.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {getRoleLabel(r)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Placeholder alert — replace this with your real message */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {/* TODO: add your alert message here */}
                            Alert message goes here.
                        </AlertDescription>
                    </Alert>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !selectedUser}
                    >
                        {loading
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding…</>
                            : "Add Member"
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}