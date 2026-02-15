import type { ReactNode } from "react"
import { Tool } from "@/canvas/Canvas"

interface ToolProps {
  tool: Tool
  icon: ReactNode
  shortcut: string
  onClick: () => void
  active: boolean
}

export const ToolButton = ({ tool, icon, shortcut, onClick, active }: ToolProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${tool} tool (${shortcut})`}
      title={`${tool} (${shortcut})`}
      className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
        active
          ? "border-blue-400/70 bg-blue-500/20 text-white shadow-[0_0_0_1px_rgba(96,165,250,0.45)]"
          : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10"
      }`}
    >
      <span className="scale-90">{icon}</span>
      <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 rounded bg-black/60 px-1 text-[10px] leading-4 text-white/70 group-hover:text-white">
        {shortcut}
      </span>
    </button>
  )
}
