"use client"

import { Scale } from "@/components/Scale"
import { Sidebar } from "@/components/Sidebar"
import { Toolbar } from "@/components/Toolbar"
import { PresenceBar } from "@/components/PresenceBar"
import { ShareButton } from "@/components/ShareButton"
import { Game, PresenceUser } from "@/render/Game"
import type { RoomData } from "@/types/room"
import { useEffect, useRef, useState, ChangeEvent } from "react"

interface CanvasProps {
  roomId: string
  socket: WebSocket
  room: RoomData
  inviteCode: string | null
}

export type Tool =
  | "select"
  | "grab"
  | "rect"
  | "ellipse"
  | "diamond"
  | "triangle"
  | "line"
  | "arrow"
  | "pencil"
  | "text"
  | "erase"

export type strokeWidth = 1 | 2 | 4

export type strokeFill =
  | "rgba(211, 211, 211)"
  | "rgba(242, 154, 158)"
  | "rgba(77, 161, 83)"
  | "rgba(98, 177, 247)"
  | "rgba(183, 98, 42)"

export type bgFill =
  | "rgba(0, 0, 0, 0)"
  | "rgba(89, 49, 49)"
  | "rgba(23, 61, 16)"
  | "rgba(30, 70, 101)"
  | "rgba(49, 37, 7)"

export type StrokeStyle = "solid" | "dashed" | "dotted"

const DRAW_TOOLS: Tool[] = ["rect", "ellipse", "diamond", "triangle", "line", "arrow", "pencil", "text"]

export const Canvas = ({ roomId, socket, room, inviteCode }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previousToolRef = useRef<Tool | null>(null)
  const [game, setGame] = useState<Game>()
  const [scale, setScale] = useState<number>(1)
  const [activeTool, setActiveTool] = useState<Tool>("grab")
  const [toolLocked, setToolLocked] = useState<boolean>(false)
  const [strokeFill, setStrokeFill] = useState<strokeFill>("rgba(211, 211, 211)")
  const [strokeWidth, setStrokeWidth] = useState<strokeWidth>(1)
  const [bgFill, setBgFill] = useState<bgFill>("rgba(0, 0, 0, 0)")
  const [opacity, setOpacity] = useState<number>(1)
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid")
  const [fontSize, setFontSize] = useState<number>(16)
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!game) return
    game.setTool(activeTool)
    game.setStrokeWidth(strokeWidth)
    game.setStrokeFill(strokeFill)
    game.setBgFill(bgFill)
    game.setOpacity(opacity)
    game.setStrokeStyle(strokeStyle)
    game.setFontSize(fontSize)
  }, [game, activeTool, strokeWidth, strokeFill, bgFill, opacity, strokeStyle, fontSize])

  useEffect(() => {
    if (!canvasRef.current) return

    const g = new Game(
      canvasRef.current,
      roomId,
      socket,
      room,
      (newScale) => setScale(newScale),
      (users) => setPresenceUsers(users)
    )

    setGame(g)

    return () => {
      g.destroy()
    }
  }, [roomId, socket, room])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return
      }

      const key = event.key.toLowerCase()
      const withMeta = event.metaKey || event.ctrlKey

      if (key === "escape") {
        event.preventDefault()
        previousToolRef.current = null
        setActiveTool("select")
        return
      }

      if (key === " " && !event.repeat && activeTool !== "grab") {
        event.preventDefault()
        previousToolRef.current = activeTool
        setActiveTool("grab")
        return
      }

      if (withMeta && key === "z") {
        event.preventDefault()
        if (event.shiftKey) game?.redo()
        else game?.undo()
        return
      }

      if (withMeta && key === "y") {
        event.preventDefault()
        game?.redo()
        return
      }

      const shortcutMap: Partial<Record<string, Tool>> = {
        v: "select",
        h: "grab",
        r: "rect",
        o: "ellipse",
        d: "diamond",
        g: "triangle",
        l: "line",
        a: "arrow",
        p: "pencil",
        t: "text",
        e: "erase",
      }

      const nextTool = shortcutMap[key]
      if (nextTool) {
        event.preventDefault()
        setActiveTool(nextTool)
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return
      }

      if (event.key === " " && previousToolRef.current) {
        event.preventDefault()
        setActiveTool(previousToolRef.current)
        previousToolRef.current = null
      }
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [game, activeTool])

  useEffect(() => {
    const finishShape = (event: MouseEvent | TouchEvent) => {
      if (toolLocked || !DRAW_TOOLS.includes(activeTool)) {
        return
      }
      const target = event.target as Node | null
      if (canvasRef.current && target && !canvasRef.current.contains(target)) {
        return
      }
      setActiveTool("select")
    }

    window.addEventListener("mouseup", finishShape)
    window.addEventListener("touchend", finishShape)

    return () => {
      window.removeEventListener("mouseup", finishShape)
      window.removeEventListener("touchend", finishShape)
    }
  }, [activeTool, toolLocked])

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !game) {
      event.target.value = ""
      return
    }

    try {
      await game.importJSON(file)
      setImportError(null)
    } catch (err) {
      setImportError((err as Error).message)
    } finally {
      event.target.value = ""
    }
  }

  return (
    <div className="h-screen w-full">
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        game={game}
        toolLocked={toolLocked}
        setToolLocked={setToolLocked}
      />
      <ShareButton inviteCode={inviteCode} />
      <PresenceBar users={presenceUsers} />
      <Sidebar
        activeTool={activeTool}
        strokeFill={strokeFill}
        setStrokeFill={setStrokeFill}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        bgFill={bgFill}
        setBgFill={setBgFill}
        opacity={opacity}
        setOpacity={setOpacity}
        strokeStyle={strokeStyle}
        setStrokeStyle={setStrokeStyle}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />
      <Scale scale={scale} />

      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 rounded-2xl border border-white/15 bg-[#1f2026]/90 p-3 shadow-lg backdrop-blur">
        <button
          type="button"
          className="rounded-md bg-primary/80 px-3 py-1 text-xs font-semibold tracking-wide text-white transition hover:bg-primary"
          onClick={() => game?.exportPNG()}
        >
          Export PNG
        </button>
        <button
          type="button"
          className="rounded-md bg-primary/80 px-3 py-1 text-xs font-semibold tracking-wide text-white transition hover:bg-primary"
          onClick={() => game?.exportSVG()}
        >
          Export SVG
        </button>
        <button
          type="button"
          className="rounded-md bg-primary/80 px-3 py-1 text-xs font-semibold tracking-wide text-white transition hover:bg-primary"
          onClick={() => game?.exportJSON()}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="rounded-md bg-muted/70 px-3 py-1 text-xs font-semibold tracking-wide text-white transition hover:bg-muted"
          onClick={() => fileInputRef.current?.click()}
        >
          Import JSON
        </button>
        {importError && <p className="text-xs text-destructive">{importError}</p>}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      <canvas ref={canvasRef} />
    </div>
  )
}
