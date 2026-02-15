"use client"

import { useEffect } from "react"
import { Canvas } from "./Canvas"
import { useSocket } from "@/hooks/useSocket"

export const RoomCanvas = ({
    roomId,
    room,
    inviteCode,
}: {
    roomId :string,
    room: any,
    inviteCode: string | null
}) => {
    useEffect(()=>{
        if (inviteCode){
            localStorage.setItem(`drawr:invite:${roomId}`, inviteCode)
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
