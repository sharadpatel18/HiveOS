// app/dashboard/components/company-overview.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const overviewMetrics = [
    { label: "Hiring pipeline filled", value: 68, color: "bg-blue-500" },
    { label: "Tasks completed this week", value: 74, color: "bg-emerald-500" },
    { label: "Team capacity utilized", value: 81, color: "bg-violet-500" },
    { label: "Interview slots booked", value: 50, color: "bg-amber-500" },
]

export function CompanyOverview() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Company Overview</CardTitle>
                <CardDescription>
                    A quick snapshot of where things stand across HiveOS
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {overviewMetrics.map((item) => (
                        <div key={item.label} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{item.label}</span>
                                <span className="text-sm font-semibold">{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="h-1.5" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}