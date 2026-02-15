"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { LoginSchema } from "@repo/common/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form"
import { Input } from "@repo/ui/input"
import { Button } from "@repo/ui/button"
import { useTransition } from "react"
import { login } from "@/actions/login"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(() =>
      login(values)
        .then((res) => {
          localStorage.setItem("token", res.token)
          router.push("/dashboard")
        })
        .catch((err) => {
          console.log(err)
        })
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="w-full text-center">Sign In to Sketchy</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} type="email" placeholder="johndoe@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="mt-4 w-full">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
