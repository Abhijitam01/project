"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusSquare, 
  LogOut, 
  ChevronRight,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@repo/ui/button";
import { safeStorageRemove } from "@/lib/storage";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

interface DashboardSidebarProps {
  username: string;
}

const SidebarItem = ({ href, icon: Icon, label, active }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
        active 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
      <span className="font-medium">{label}</span>
      {active && <ChevronRight className="ml-auto w-4 h-4" />}
    </Link>
  );
};

export function DashboardSidebar({ username }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    safeStorageRemove("token");
    router.push("/signin");
  };

  return (
    <div className="w-64 h-screen border-r border-border bg-card flex flex-col p-4 fixed left-0 top-0 z-20">
      <div className="mb-8 px-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Monitor className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Sketchy</span>
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">Signed in as <span className="font-semibold text-foreground">{username}</span></p>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <SidebarItem 
          href="/dashboard" 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={pathname === "/dashboard"} 
        />
        <SidebarItem 
          href="/create-room" 
          icon={PlusSquare} 
          label="Create Room" 
          active={pathname === "/create-room"} 
        />
      </div>

      <div className="mt-auto border-t border-border pt-4 flex flex-col gap-1">
        <Button 
          variant="ghost" 
          className="justify-start gap-3 px-3 py-2 h-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
}
