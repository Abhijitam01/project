"use client"

import { useEffect, useState } from "react"

interface Room {
    id: string
    roomName: string
    shape: []
    userId: string
}

export const useRoomByName = (roomName: string) => {
    const [room, setRoom] = useState<Room>()

    useEffect(()=>{
        const token = localStorage.getItem("token")

        const fetchRoom = async () => {
            try{
                const response = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/room/${roomName}`, {
                    method: "GET",
                    headers: {
                        "authorization": token || ""
                    }
                })

                if(!response.ok){
                    throw new Error("Something went wrong")
                }

                const data : { room: Room } = await response.json()
                setRoom(data.room)

            }
            catch(err : any){
                console.log(err.message) 
            }
        }

        fetchRoom()
    }, [])

    return room
}
