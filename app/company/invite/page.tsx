import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import AcceptInvitationPage from "./components/accept-invitation"

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-muted/40">
                <div className="flex flex-col items-center gap-6">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-5 w-48 rounded" />
                </div>
            </div>
        }>
            <AcceptInvitationPage />
        </Suspense>
    )
}