"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateRoomSchema } from "@repo/common/types";
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
import { Loader2, Plus } from "lucide-react";
import { getPublicHttpUrl } from "@/lib/public-urls";
import { safeStorageGet } from "@/lib/storage";

export function CreateRoomCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof CreateRoomSchema>>({
    resolver: zodResolver(CreateRoomSchema),
    defaultValues: { roomName: "", isPrivate: false },
  });

  const onSubmit = async (values: z.infer<typeof CreateRoomSchema>) => {
    setIsSubmitting(true);
    setError("");

    const token = safeStorageGet("token");
    if (!token) {
      setError("Not authenticated. Please sign in again.");
      setIsSubmitting(false);
      router.replace("/signin");
      return;
    }

    try {
      const response = await fetch(`${getPublicHttpUrl()}/room`, {
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
    <div className="rounded-xl border border-white/[0.08] bg-[#1e1e2e] p-5">
      <p className="mb-4 text-sm font-medium text-white/70">New room</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="roomName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-white/50">Room name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="my-project"
                    disabled={isSubmitting}
                    className="border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/20 focus:border-indigo-500/60"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {error && <p className="text-xs text-red-400">{error}</p>}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPrivate"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs text-white/50">Private</FormLabel>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isSubmitting}
                      className="h-3.5 w-3.5 accent-indigo-500"
                    />
                  </FormControl>
                </div>
                <FormDescription className="text-[11px] text-white/25">
                  Requires invite link to join.
                </FormDescription>
              </FormItem>
            )}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
            ) : (
              <><Plus className="h-4 w-4" /> Create & join</>
            )}
          </button>
        </form>
      </Form>
    </div>
  );
}
