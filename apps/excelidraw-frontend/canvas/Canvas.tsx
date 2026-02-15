"use client"

import { Scale } from "@/components/Scale"
import { Sidebar } from "@/components/Sidebar"
import { Toolbar } from "@/components/Toolbar"
import { PresenceBar } from "@/components/PresenceBar"
import { ShareButton } from "@/components/ShareButton"
import { Game, PresenceUser, TextInputRequest } from "@/render/Game"
import type { RoomData } from "@/types/room"
import { useEffect, useRef, useState, ChangeEvent, type ReactNode } from "react"
import { Download, FolderOpen, Menu, RotateCcw, X } from "lucide-react"

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

const DRAW_TOOLS: Tool[] = ["rect", "ellipse", "diamond", "triangle", "line", "arrow", "pencil"]

export const Canvas = ({ roomId, socket, room, inviteCode }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previousToolRef = useRef<Tool | null>(null)
  const toolLockedRef = useRef<boolean>(false)
  const [game, setGame] = useState<Game>()
  const [scale, setScale] = useState<number>(1)
  const [activeTool, setActiveTool] = useState<Tool>("grab")
  const [toolLocked, setToolLocked] = useState<boolean>(false)
  const [returnToolAfterSelect, setReturnToolAfterSelect] = useState<Tool | null>(null)
  const [strokeFill, setStrokeFill] = useState<strokeFill>("rgba(211, 211, 211)")
  const [strokeWidth, setStrokeWidth] = useState<strokeWidth>(1)
  const [bgFill, setBgFill] = useState<bgFill>("rgba(0, 0, 0, 0)")
  const [opacity, setOpacity] = useState<number>(1)
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid")
  const [fontSize, setFontSize] = useState<number>(16)
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const [textInput, setTextInput] = useState<(TextInputRequest & { value: string }) | null>(null)
  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    toolLockedRef.current = toolLocked
  }, [toolLocked])

  useEffect(() => {
    if (activeTool !== "select") {
      setIsSelectMenuOpen(false)
    }
  }, [activeTool])

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
      (users) => setPresenceUsers(users),
      () => {
        if (toolLockedRef.current) return
        setReturnToolAfterSelect((currentReturnTool) => {
          if (!currentReturnTool) return currentReturnTool
          setActiveTool(currentReturnTool)
          return null
        })
      },
      (request) => {
        setTextInput({
          ...request,
          value: "",
        })
      },
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
      game?.selectLastShape()
      setReturnToolAfterSelect(activeTool)
      setActiveTool("select")
    }

    window.addEventListener("mouseup", finishShape)
    window.addEventListener("touchend", finishShape)

    return () => {
      window.removeEventListener("mouseup", finishShape)
      window.removeEventListener("touchend", finishShape)
    }
  }, [activeTool, toolLocked, game])

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

  const handleTextSubmit = () => {
    if (!textInput || !game) return
    const nextValue = textInput.value.trim()
    if (!nextValue) {
      setTextInput(null)
      return
    }
    game.addTextShape(textInput.x, textInput.y, nextValue, textInput.fontSize, textInput.strokeFill, textInput.opacity)
    game.selectLastShape()
    if (!toolLocked) {
      setReturnToolAfterSelect("text")
      setActiveTool("select")
    }
    setTextInput(null)
  }

  const parseMermaidSize = (svg: string) => {
    const viewBoxMatch = svg.match(/viewBox=\"([^\"]+)\"/)
    if (viewBoxMatch?.[1]) {
      const values = viewBoxMatch[1].trim().split(/\s+/).map(Number)
      if (values.length === 4 && Number.isFinite(values[2]) && Number.isFinite(values[3])) {
        const rawWidth = values[2] ?? 420
        const rawHeight = values[3] ?? 260
        return {
          width: Math.max(160, Math.min(640, rawWidth)),
          height: Math.max(120, Math.min(420, rawHeight)),
        }
      }
    }
    return { width: 420, height: 260 }
  }

  const handleInsertMermaid = async (definition: string) => {
    if (!game) {
      throw new Error("Canvas is not ready yet")
    }
    const trimmed = definition.trim()
    if (!trimmed) {
      throw new Error("Mermaid definition is empty")
    }

    const mermaidModule = await import("mermaid")
    const mermaid = mermaidModule.default
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "dark",
    })

    const diagramId = `drawr-mermaid-${Date.now()}`
    const renderResult = await mermaid.render(diagramId, trimmed)
    const size = parseMermaidSize(renderResult.svg)
    const center = game.getViewportCenter()
    game.addMermaidShape(center.x - size.width / 2, center.y - size.height / 2, size.width, size.height, renderResult.svg, opacity)
    game.selectLastShape()
    if (!toolLocked) {
      setReturnToolAfterSelect("select")
      setActiveTool("select")
    }
  }

  return (
    <div className="h-screen w-full">
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
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
        onInsertMermaid={handleInsertMermaid}
      />
      <Scale scale={scale} />

      {activeTool === "select" ? (
        <div className="fixed left-4 top-4 z-[60]">
          <button
            type="button"
            onClick={() => setIsSelectMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-[#1f2026]/95 text-white/80 shadow-lg backdrop-blur transition hover:bg-[#2a2d37] hover:text-white"
            aria-label={isSelectMenuOpen ? "Close menu" : "Open menu"}
            title={isSelectMenuOpen ? "Close menu" : "Open menu"}
          >
            {isSelectMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {isSelectMenuOpen ? (
            <div className="mt-2 w-64 rounded-2xl border border-white/15 bg-[#1f2026]/95 p-3 text-white shadow-xl backdrop-blur">
              <p className="mb-2 px-1 text-xs uppercase tracking-[0.2em] text-white/50">Canvas Menu</p>
              <div className="space-y-1">
                <MenuAction label="Import JSON" icon={<FolderOpen className="h-4 w-4" />} onClick={() => fileInputRef.current?.click()} />
                <MenuAction label="Export PNG" icon={<Download className="h-4 w-4" />} onClick={() => game?.exportPNG()} />
                <MenuAction label="Export SVG" icon={<Download className="h-4 w-4" />} onClick={() => game?.exportSVG()} />
                <MenuAction label="Export JSON" icon={<Download className="h-4 w-4" />} onClick={() => game?.exportJSON()} />
                <MenuAction
                  label="Reset Canvas"
                  icon={<RotateCcw className="h-4 w-4" />}
                  onClick={() => game?.resetCanvas()}
                  danger
                />
              </div>
              {importError ? <p className="mt-2 text-xs text-red-300">{importError}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <input
        type="file"
        ref={fileInputRef}
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      {textInput ? (
        <input
          autoFocus
          value={textInput.value}
          onChange={(event) => setTextInput((prev) => (prev ? { ...prev, value: event.target.value } : prev))}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              handleTextSubmit()
            }
            if (event.key === "Escape") {
              event.preventDefault()
              setTextInput(null)
            }
          }}
          onBlur={handleTextSubmit}
          className="fixed z-[70] min-w-44 rounded-md border border-white/25 bg-[#11131a]/95 px-2 py-1 text-sm text-white outline-none ring-1 ring-blue-400/40"
          style={{
            left: textInput.screenX + 8,
            top: textInput.screenY + 8,
            fontSize: textInput.fontSize,
            color: textInput.strokeFill,
          }}
          placeholder="Type text and press Enter"
        />
      ) : null}

      <canvas ref={canvasRef} />
    </div>
  )
}

const MenuAction = ({
  label,
  icon,
  onClick,
  danger,
}: {
  label: string
  icon: ReactNode
  onClick: () => void
  danger?: boolean
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
        danger
          ? "text-red-200 hover:bg-red-500/10 hover:text-red-100"
          : "text-white/85 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
