"use client"

import { useEffect, useState } from "react"
import { Canvas } from "./Canvas"
import { Toolbar } from "@/components/Toolbar"

export const RoomCanvas = ({roomId, room}: {roomId :string, room: any}) => {
    const [socket,  setSocket] = useState<WebSocket | null>(null)

    useEffect(()=>{
        const token = localStorage.getItem("token")
        
        // Defensive check for token or WS_URL
        if (!process.env.NEXT_PUBLIC_WS_URL || !token) {
            console.error("Missing WS_URL or token");
            return;
        }

        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/?token=${token}`)

        const handleOpen = () => {
            setSocket(ws)
            
            const data = JSON.stringify({
                type: "join_room",
                roomId
            })

            // Ensure connection is open before sending
            if (ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(data)
                } catch (e) {
                    console.error("Error sending join_room:", e)
                }
            }
        }
        
        ws.addEventListener('open', handleOpen)

        return () => {
            ws.removeEventListener('open', handleOpen)
            if (ws.readyState === WebSocket.OPEN) {
                const leaveData = JSON.stringify({
                    type: "leave_room"
                })
                try {
                    ws.send(leaveData)
                } catch (e) {
                     console.error("Error sending leave_room:", e)
                }
            }
            ws.close()
        }
    }, [])

    if(!socket){
      return  <div>
            Connecting to WebSocket...
        </div>
    }

    return(

            <Canvas roomId={roomId} socket={socket} room={room} />

    )

    
}