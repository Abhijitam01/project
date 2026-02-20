"use client"

import { useEffect, useState } from "react"
import { safeStorageGet } from "@/lib/storage"

interface Room {
    id: string
    roomName: string
    shape: []
    userId: string
}

export const useRoomByName = (roomName: string) => {
    const [room, setRoom] = useState<Room>()

    useEffect(()=>{
        const token = safeStorageGet("token")

        const fetchRoom = async () => {
            try{
                const response = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/room/${roomName}`, {
                    method: "GET",
                    headers: {
                        "authorization": token ? `Bearer ${token}` : ""
                    }
                })

                if(!response.ok){
                    throw new Error("Something went wrong")
                }

                const data : { room: Room } = await response.json()
                setRoom(data.room)

            }
            catch(err : unknown){
                console.error(err instanceof Error ? err.message : "Failed to load room")
            }
        }

        fetchRoom()
    }, [])

    return room
}
