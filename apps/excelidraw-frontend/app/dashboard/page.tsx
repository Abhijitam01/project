"use client"

import { useUser } from "@/hooks/useUser"
import { DashboardLayout } from "@/components/DashboardLayout"
import { CreateRoomCard } from "@/components/CreateRoomCard"
import { RoomList } from "@/components/RoomList"
import { Sparkles, History } from "lucide-react"

const Dashboard = () => {
  const { user } = useUser()

  const rooms = user?.user?.room || [];

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header Section */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm font-bold text-primary uppercase tracking-widest">Welcome Back</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Hello, <span className="text-primary">{user?.user?.name || "Designer"}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Pick up where you left off or start a fresh canvas for your next big idea.
          </p>
        </section>

        {/* Action Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <CreateRoomCard />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <History className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-2xl font-bold">Recent Rooms</h2>
              <span className="ml-auto bg-muted px-2 py-0.5 rounded text-xs font-medium text-muted-foreground">
                {rooms.length} Total
              </span>
            </div>
            
            <RoomList rooms={rooms} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
