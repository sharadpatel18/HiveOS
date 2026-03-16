"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

import { CheckCircle2, XCircle, Clock, Building2, UserCheck, Briefcase, Crown, MailCheck, MoveRight, ShieldAlert } from "lucide-react"
import { getInvitationById, joinCompanyReq } from "@/services/company-service"

// ---- Types ----------------------------------------------------------------

type InviteStatus = "loading" | "valid" | "accepting" | "accepted" | "invalid" | "expired"
interface Invite {
    id: string;
    email: string;
    role: "FOUNDER" | "RECRUITER" | "EMPLOYEE" | "TEAMLEAD" | "MANAGER";

    company: {
        id: string;
        name: string;
        slug: string;
        size: string;
        founder: string;
        website: string | null;
        industry: string | null;
        description: string | null;
    };

    invitedBy: {
        id: string;
        name: string;
        email: string;
    };
}

// ---- Helpers ---------------------------------------------------------------

const ROLE_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    RECRUITER: {
        label: "Recruiter",
        color: "bg-violet-100 text-violet-800 border-violet-200",
        icon: UserCheck,
    },
    EMPLOYEE: {
        label: "Employee",
        color: "bg-sky-100 text-sky-800 border-sky-200",
        icon: Briefcase,
    },
    FOUNDER: {
        label: "Founder",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Crown,
    },
    TEAMLEAD: {
        label: "Team Lead",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: MailCheck,
    },
    MANAGER: {
        label: "Manager",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: MoveRight,
    },
}

// ---- Sub-components --------------------------------------------------------

function LoadingState() {
    return (
        <div className="flex flex-col items-center gap-6 py-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="w-full space-y-3">
                <Skeleton className="h-5 w-3/4 mx-auto rounded" />
                <Skeleton className="h-4 w-1/2 mx-auto rounded" />
            </div>
            <Skeleton className="h-px w-full rounded" />
            <div className="w-full space-y-3">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
            </div>
            <Skeleton className="h-10 w-full rounded" />
        </div>
    )
}

function AcceptedState({ companyName, router }: { companyName: string; router: ReturnType<typeof useRouter> }) {
    return (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">You're in!</h2>
                <p className="text-sm text-muted-foreground">
                    You've successfully joined <span className="font-medium text-foreground">{companyName}</span>.
                </p>
            </div>
            <Alert className="text-left border-emerald-200 bg-emerald-50 text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription>
                    Your account is now active. Head to your dashboard to get started.
                </AlertDescription>
            </Alert>
            <Button className="w-full gap-2" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
                <MoveRight className="h-4 w-4" />
            </Button>
        </div>
    )
}

function InvalidState({ reason }: { reason: "invalid" | "expired" }) {
    const isExpired = reason === "expired"
    return (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div className={`flex items-center justify-center h-16 w-16 rounded-full ${isExpired ? "bg-amber-100" : "bg-red-100"}`}>
                {isExpired
                    ? <Clock className="h-8 w-8 text-amber-600" />
                    : <XCircle className="h-8 w-8 text-red-600" />
                }
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">
                    {isExpired ? "Invitation Expired" : "Invalid Invitation"}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {isExpired
                        ? "This invitation link has expired. Please ask the sender to resend it."
                        : "This invitation link is invalid or has already been used."}
                </p>
            </div>
            <Alert className={`text-left ${isExpired ? "border-amber-200 bg-amber-50 text-amber-800" : "border-red-200 bg-red-50 text-red-800"}`}>
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                    {isExpired
                        ? "Invitation links are valid for 7 days after they are sent."
                        : "If you believe this is a mistake, please contact the person who invited you."}
                </AlertDescription>
            </Alert>
        </div>
    )
}

// ---- Main Page -------------------------------------------------------------

export default function AcceptInvitationPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [status, setStatus] = useState<InviteStatus>("loading")
    const [invite, setInvite] = useState<Invite | null>(null)

    // Validate token on mount
    useEffect(() => {
        if (!token) {
            setStatus("invalid")
            return
        }

        async function validateToken() {
            try {
                // TODO: replace with your actual API call
                const res = await getInvitationById();
                setInvite(res[0])
                setStatus("valid")
            } catch {
                setStatus("invalid")
            }
        }

        validateToken()
    }, [token])

    // Accept invitation
    const handleAccept = async () => {
        if (!token || !invite) return
        setStatus("accepting")
        try {
            // TODO: replace with your actual API call
            const payload = {
                token,
                id: invite.id,
                role: invite.role
            }

            const res = await joinCompanyReq(payload);
            if (res) {
                setStatus("accepted")
            }
            // // await acceptInvite(token)
            // await new Promise((r) => setTimeout(r, 1200))
        } catch {
            setStatus("invalid")
        }
    }

    const roleMeta = invite ? ROLE_META[invite.role] : null
    const RoleIcon = roleMeta?.icon ?? Briefcase

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
            <div className="w-full max-w-md space-y-6">

                {/* Logo / Brand */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-muted-foreground">Company Workspace</p>
                </div>

                {/* Main Card */}
                <Card className="shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-center">
                            {status === "loading" && "Verifying Invitation..."}
                            {status === "valid" && "You've Been Invited"}
                            {status === "accepting" && "Accepting Invitation..."}
                            {status === "accepted" && "Invitation Accepted"}
                            {status === "invalid" && "Invalid Invitation"}
                            {status === "expired" && "Invitation Expired"}
                        </CardTitle>
                        {(status === "valid" || status === "accepting") && (
                            <CardDescription className="text-center">
                                Review the details below and accept to join the team.
                            </CardDescription>
                        )}
                    </CardHeader>

                    <CardContent>
                        {/* Loading */}
                        {status === "loading" && <LoadingState />}

                        {/* Accepted */}
                        {status === "accepted" && invite && (
                            <AcceptedState companyName={invite.company.name} router={router} />
                        )}

                        {/* Invalid / Expired */}
                        {(status === "invalid" || status === "expired") && (
                            <InvalidState reason={status} />
                        )}

                        {/* Valid — show invite details */}
                        {(status === "valid" || status === "accepting") && invite && roleMeta && (
                            <div className="flex flex-col gap-5">

                                {/* Invite summary */}
                                <div className="rounded-xl border bg-muted/30 divide-y">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-xs text-muted-foreground font-medium">Company</span>
                                        <span className="text-sm font-semibold flex items-center gap-1.5">
                                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            {invite.company.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-xs text-muted-foreground font-medium">Invited by</span>
                                        <span className="text-sm font-medium">{invite.invitedBy.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-xs text-muted-foreground font-medium">Email</span>
                                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                            <MailCheck className="h-3.5 w-3.5" />
                                            {invite.email}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-xs text-muted-foreground font-medium">Your role</span>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs font-medium flex items-center gap-1 ${roleMeta.color}`}
                                        >
                                            <RoleIcon className="h-3 w-3" />
                                            {roleMeta.label}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                {/* Accept button */}
                                <Button
                                    className="w-full gap-2"
                                    onClick={handleAccept}
                                    disabled={status === "accepting"}
                                >
                                    {status === "accepting" ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Accepting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Accept Invitation
                                        </>
                                    )}
                                </Button>

                                {/* <p className="text-xs text-center text-muted-foreground">
                                    By accepting, you agree to join{" "}
                                    <span className="font-medium text-foreground">{invite.company.name}</span>{" "}
                                    as a <span className="font-medium text-foreground">{roleMeta.label}</span>.
                                </p> */}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    Having trouble? Contact your team admin for a new invite link.
                </p>
            </div>
        </div>
    )
}