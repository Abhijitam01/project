"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateRoomSchema } from "@repo/common/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { safeStorageGet } from "@/lib/storage";

export function CreateRoomCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof CreateRoomSchema>>({
    resolver: zodResolver(CreateRoomSchema),
    defaultValues: {
      roomName: "",
      isPrivate: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof CreateRoomSchema>) => {
    setIsSubmitting(true);
    setError("");

    const token = safeStorageGet("token");
    if (!token) {
      setError("You are not authenticated. Please sign in again.");
      setIsSubmitting(false);
      router.replace("/signin");
      return;
    }

    if (!process.env.NEXT_PUBLIC_HTTP_URL) {
      setError("Client config is missing NEXT_PUBLIC_HTTP_URL.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const responseData = (await response.json().catch(() => null)) as
        | { room?: { inviteCode?: string | null }; error?: string; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(responseData?.error || responseData?.message || "Unable to create room");
      }

      if (responseData?.error) {
        setError(responseData.error);
      } else {
        const inviteQuery = responseData?.room?.inviteCode ? `?invite=${responseData.room.inviteCode}` : "";
        router.push(`/room/${values.roomName}${inviteQuery}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-lg">
      <div className="h-2 bg-primary" />
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <CardTitle>Create New Room</CardTitle>
        </div>
        <CardDescription>
          Start a new collaborative drawing session. Pick a unique name for your room.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="roomName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-foreground/80">Room Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., My Awesome Project"
                      disabled={isSubmitting}
                      className="bg-muted/50 border-input hover:border-primary/50 transition-colors h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive font-medium" />
                  {error && <p className="text-sm text-destructive font-medium mt-2">{error}</p>}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-semibold text-foreground/80">Private Room</FormLabel>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(event) => field.onChange(event.target.checked)}
                        disabled={isSubmitting}
                        className="h-4 w-4 accent-primary"
                      />
                    </FormControl>
                  </div>
                  <FormDescription className="text-xs text-muted-foreground">
                    Requires the invite link for others to join.
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Room...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" />
                  Create & Join Room
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
