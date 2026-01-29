"use client"

import { Scale } from "@repo/ui/Scale"
import { Sidebar } from "@repo/ui/Sidebar"
import { Toolbar } from "@repo/ui/Toolbar"
import { Game } from "@/render/Game"
import { useEffect, useRef, useState } from "react"
import { RoomResponse, Tool, strokeFill, strokeWidth, bgFill } from "@repo/common"

interface CanvasProps {
    roomId: string
    socket: WebSocket
    room: RoomResponse
}

export const Canvas = ({roomId, socket , room}: CanvasProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [game, setGame] = useState<Game>()
    const [scale, setScale] = useState<number>(1)
    const [activeTool, setActiveTool] = useState<Tool>("grab")
    const [strokeFill, setStrokeFill] = useState<strokeFill>("rgba(211, 211, 211)")
    const [strokeWidth, setStrokeWidth] = useState<strokeWidth>(1)
    const [bgFill, setBgFill] = useState<bgFill>("rgba(0, 0, 0, 0)")

    useEffect(()=>{
        game?.setTool(activeTool)
        game?.setStrokeWidth(strokeWidth)
        game?.setStrokeFill(strokeFill)
        game?.setBgFill(bgFill)
    })

    useEffect(()=>{
        if(canvasRef.current){
            const g = new Game(
                canvasRef.current , 
                roomId, 
                socket , 
                room,
                (newScale) => setScale(newScale)
            )
            setGame(g)


            return () =>{
                g.destroy()
            }
        }

    }, [canvasRef])


    useEffect(()=>{
        setScale(game?.outputScale || 1)
    }, [game?.outputScale])


    


    return(
        <div className="w-full h-screen">

        <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
        <Sidebar activeTool={activeTool} 
        strokeFill={strokeFill} 
        setStrokeFill={setStrokeFill} 
        strokeWidth={strokeWidth} 
        setStrokeWidth={setStrokeWidth} 
        bgFill={bgFill} 
        setBgFill={setBgFill} />
        <Scale scale={scale} />
            <canvas ref={canvasRef} />

        </div>
    )
}