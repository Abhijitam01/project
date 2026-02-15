"use client"

import { useEffect } from "react"
import { Canvas } from "./Canvas"
import { useSocket } from "@/hooks/useSocket"
import type { RoomData } from "@/types/room"
import { safeStorageSet } from "@/lib/storage"

export const RoomCanvas = ({
    roomId,
    room,
    inviteCode,
}: {
    roomId: string,
    room: RoomData,
    inviteCode: string | null
}) => {
    useEffect(()=>{
        if (inviteCode){
            safeStorageSet(`drawr:invite:${roomId}`, inviteCode)
        }
    }, [inviteCode, roomId])

    const socket = useSocket(roomId, inviteCode)

    if(!socket){
      return  <div>
            Connecting to WebSocket...
        </div>
    }

    return(

            <Canvas roomId={roomId} socket={socket} room={room} inviteCode={inviteCode} />

    )

    
}
