"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { ArrowRight, Users, Hash } from "lucide-react";

interface Room {
  id: string;
  roomName: string;
}

interface RoomListProps {
  rooms: Room[];
}

export function RoomList({ rooms }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <Card className="bg-muted/50 border-dashed border-2 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
          <Hash className="w-8 h-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl mb-2">No Rooms Found</CardTitle>
        <CardDescription className="max-w-xs mx-auto mb-6">
          You haven&apos;t created or joined any rooms yet. Start by creating one above!
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <Card key={room.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 overflow-hidden flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="px-2 py-1 bg-primary/10 rounded text-[10px] font-bold text-primary uppercase tracking-wider">
                Active
              </div>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl group-hover:text-primary transition-colors truncate">
              {room.roomName}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs truncate">
              <Hash className="w-3 h-3" />
              {room.id}
            </CardDescription>
          </CardHeader>
          
          <CardFooter className="mt-auto pt-4 border-t border-border/50">
            <Link href={`/room/${room.roomName}`} className="w-full">
              <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                Join Room
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
