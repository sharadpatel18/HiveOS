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
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { useAuthStore } from "@/store/auth-store"
import { createCompany } from "@/services/company-service"
import { ICompany } from "@/types/company"

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
    const user = useAuthStore((state) => state.user)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        size: "",
        founder: user?.fullName,
        website: "",
        industry: "",
    })

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const payload: ICompany = {
            ...formData,
            slug: toSlug(formData.name),
            website: formData.website || null,
            industry: formData.industry || null,
            founder: user?.fullName || "",
        }

        try {
            setLoading(true)
            const res = await createCompany(payload);
        } catch (err) {
            console.log(err)
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
                        <Input
                            name="name"
                            placeholder="Acme Inc."
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Founder name</Label>
                        <Input value={formData.founder} readOnly />
                    </div>

                    <div className="space-y-1">
                        <Label>Company size</Label>
                        <Select
                            onValueChange={(value) =>
                                setFormData({ ...formData, size: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-10">1–10</SelectItem>
                                <SelectItem value="10-50">10–50</SelectItem>
                                <SelectItem value="50-200">50–200</SelectItem>
                                <SelectItem value="200-500">200–500</SelectItem>
                                <SelectItem value="500+">500+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Website</Label>
                        <Input
                            name="website"
                            placeholder="https://example.com"
                            value={formData.website}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Industry</Label>
                        <Input
                            name="industry"
                            placeholder="Software, Finance, Healthcare"
                            value={formData.industry}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>About</Label>
                        <Textarea
                            name="description"
                            placeholder="What does your company do?"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || !formData.size}
                    >
                        {loading ? "Creating..." : "Create company"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}