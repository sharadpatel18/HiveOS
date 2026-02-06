"use client"

import { useState } from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

// helper to create slug
const toSlug = (text: string) =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

export default function CreateCompanyDialog({
    children,
}: {
    children: React.ReactNode
}) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const form = e.currentTarget
        const formData = new FormData(form)

        const name = formData.get("name") as string

        const payload = {
            name,
            slug: toSlug(name),
            description: formData.get("description"),
            size: formData.get("size"),
            founder: formData.get("founder"),
            website: formData.get("website") || null,
            industry: formData.get("industry") || null,
        }

        try {
            setLoading(true)

            const res = await fetch("/api/companies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                throw new Error("Failed to create company")
            }

            // optional: refresh or close dialog
            window.location.reload()
        } catch (err) {
            alert("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create company</DialogTitle>
                    <DialogDescription>
                        Enter company details. You will become the founder.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-1">
                        <Label>Company name</Label>
                        <Input name="name" placeholder="Acme Inc." required />
                    </div>

                    <div className="space-y-1">
                        <Label>Founder name</Label>
                        <Input name="founder" placeholder="John Doe" required />
                    </div>

                    <div className="space-y-1">
                        <Label>Company size</Label>
                        <Input
                            name="size"
                            placeholder="1-10, 10-50, 50-200..."
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Website</Label>
                        <Input
                            name="website"
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Industry</Label>
                        <Input
                            name="industry"
                            placeholder="Software, Finance, Healthcare"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>About</Label>
                        <Textarea
                            name="description"
                            placeholder="What does your company do?"
                            rows={4}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating..." : "Create company"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
