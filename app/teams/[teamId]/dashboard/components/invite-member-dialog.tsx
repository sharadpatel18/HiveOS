// app/teams/[teamId]/dashboard/_components/invite-member-dialog.tsx
"use client"

import { useState } from "react"
import {
  Copy,
  Link2,
  Mail,
  Check,
  UserPlus,
  Clock,
  Send,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamName: string
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  teamName,
}: InviteMemberDialogProps) {
  const [emails, setEmails] = useState("")
  const [role, setRole] = useState("member")
  const [message, setMessage] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const [linkExpiry, setLinkExpiry] = useState("7days")
  const [emailList, setEmailList] = useState<string[]>([])

  const inviteLink = "https://app.yourcompany.com/join/FE-2024-xK9mN"

  const handleAddEmail = () => {
    const newEmails = emails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e && e.includes("@") && !emailList.includes(e))

    setEmailList([...emailList, ...newEmails])
    setEmails("")
  }

  const handleRemoveEmail = (email: string) => {
    setEmailList(emailList.filter((e) => e !== email))
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleSendInvites = () => {
    console.log("Sending invites to:", emailList, "with role:", role)
    setEmailList([])
    setMessage("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite to {teamName}
          </DialogTitle>
          <DialogDescription>
            Invite new members to join your team via email or shareable link.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email Invite
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              Invite Link
            </TabsTrigger>
          </TabsList>

          {/* ========== EMAIL TAB ========== */}
          <TabsContent value="email" className="space-y-4 mt-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="emails">Email addresses</Label>
              <div className="flex gap-2">
                <Input
                  id="emails"
                  placeholder="Enter email addresses (comma separated)"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddEmail()
                    }
                  }}
                />
                <Button variant="secondary" size="sm" onClick={handleAddEmail} className="shrink-0">
                  Add
                </Button>
              </div>
            </div>

            {/* Email Tags */}
            {emailList.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {emailList.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    <div className="flex flex-col">
                      <span>Member</span>
                      <span className="text-xs text-muted-foreground">
                        Can view and manage tasks
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex flex-col">
                      <span>Viewer</span>
                      <span className="text-xs text-muted-foreground">
                        Read-only access
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Personal Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Personal message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a note to your invitation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            {/* Send Button */}
            <Button
              className="w-full gap-2"
              onClick={handleSendInvites}
              disabled={emailList.length === 0}
            >
              <Send className="h-4 w-4" />
              Send {emailList.length > 0 ? `${emailList.length} ` : ""}Invite
              {emailList.length !== 1 ? "s" : ""}
            </Button>
          </TabsContent>

          {/* ========== LINK TAB ========== */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {linkCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can join the team
              </p>
            </div>

            <Separator />

            {/* Link Settings */}
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Expires after
                </Label>
                <Select value={linkExpiry} onValueChange={setLinkExpiry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24hours">24 hours</SelectItem>
                    <SelectItem value="7days">7 days</SelectItem>
                    <SelectItem value="30days">30 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2">
              <Link2 className="h-4 w-4" />
              Generate New Link
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}