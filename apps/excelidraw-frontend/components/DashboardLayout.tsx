"use client";

import { DashboardSidebar } from "./DashboardSidebar";
import { useUser } from "@/hooks/useUser";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading your space...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Oops!</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          {error?.toString() || "We couldn't find your user information. Please try logging in again."}
        </p>
        <Link href="/signin">
          <Button size="lg" className="px-8">
            Go to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
