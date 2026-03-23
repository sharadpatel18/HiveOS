"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"                          // ✅ removed useEffect
import { toast } from "sonner"
import { getUserData, loginUser } from "@/services/auth-services"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const setUser = useAuthStore.getState().setUser;
  const redirect = searchParams.get("redirect")
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isMount, setIsMount] = useState(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      toast.success(response.message);
      const user = await getUserData();
      setUser(user);
      if (user) {
        router.push(redirect ?? "/dashboard");
      }
    } catch (error) {
      toast.error(`Something went wrong ${error}`);
    }
  }

  useEffect(() => {
    setIsMount(true)
  }, [])

  if (!isMount) {
    return null
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link href="/" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}