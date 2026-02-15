import { bgFill, strokeFill, strokeWidth, Tool, StrokeStyle } from "@/canvas/Canvas"
import React from "react"

interface SidebarProps {
  activeTool: Tool
  strokeFill: strokeFill
  setStrokeFill: React.Dispatch<React.SetStateAction<strokeFill>>
  strokeWidth: strokeWidth
  setStrokeWidth: React.Dispatch<React.SetStateAction<strokeWidth>>
  bgFill: bgFill
  setBgFill: React.Dispatch<React.SetStateAction<bgFill>>
  opacity: number
  setOpacity: React.Dispatch<React.SetStateAction<number>>
  strokeStyle: StrokeStyle
  setStrokeStyle: React.Dispatch<React.SetStateAction<StrokeStyle>>
  fontSize: number
  setFontSize: React.Dispatch<React.SetStateAction<number>>
}

export const Sidebar = ({
  activeTool,
  strokeFill,
  setStrokeFill,
  strokeWidth,
  setStrokeWidth,
  bgFill,
  setBgFill,
  opacity,
  setOpacity,
  strokeStyle,
  setStrokeStyle,
  fontSize,
  setFontSize,
}: SidebarProps) => {
  const strokeFills: strokeFill[] = [
    "rgba(211, 211, 211)",
    "rgba(242, 154, 158)",
    "rgba(77, 161, 83)",
    "rgba(98, 177, 247)",
    "rgba(183, 98, 42)",
  ]

  const strokeWidths: strokeWidth[] = [1, 2, 4]

  const bgFills: bgFill[] = [
    "rgba(0, 0, 0, 0)",
    "rgba(89, 49, 49)",
    "rgba(23, 61, 16)",
    "rgba(30, 70, 101)",
    "rgba(49, 37, 7)",
  ]

  const strokeStyles: StrokeStyle[] = ["solid", "dashed", "dotted"]

  if (activeTool === "erase" || activeTool === "grab" || activeTool === "select") {
    return null
  }

  return (
    <aside className="fixed right-5 top-24 z-40 w-64 rounded-2xl border border-white/15 bg-[#1f2026]/95 p-4 text-white shadow-xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold tracking-wide text-white/95">Style</p>
        <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] uppercase text-white/60">{activeTool}</span>
      </div>

      <div className="space-y-4">
        <ControlBlock label="Stroke">
          <div className="flex flex-wrap gap-2">
            {strokeFills.map((fill) => (
              <ColorIndicator
                key={fill}
                color={fill}
                onClick={() => setStrokeFill(fill)}
                isActive={strokeFill === fill}
                ariaLabel={`Set stroke color ${fill}`}
              />
            ))}
          </div>
        </ControlBlock>

        {(activeTool === "rect" ||
          activeTool === "ellipse" ||
          activeTool === "diamond" ||
          activeTool === "triangle") && (
          <ControlBlock label="Background">
            <div className="flex flex-wrap gap-2">
              {bgFills.map((fill) => (
                <ColorIndicator
                  key={fill}
                  color={fill}
                  onClick={() => setBgFill(fill)}
                  isActive={bgFill === fill}
                  transparent={fill === "rgba(0, 0, 0, 0)"}
                  ariaLabel={`Set fill color ${fill}`}
                />
              ))}
            </div>
          </ControlBlock>
        )}

        <ControlBlock label="Stroke Width">
          <div className="flex gap-2">
            {strokeWidths.map((width) => (
              <button
                key={width}
                type="button"
                onClick={() => setStrokeWidth(width)}
                className={`flex h-8 w-10 items-center justify-center rounded border transition-colors ${
                  strokeWidth === width
                    ? "border-blue-400/70 bg-blue-500/20"
                    : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
                aria-label={`Set stroke width ${width}`}
              >
                <span style={{ height: `${width}px` }} className="w-6 bg-white/85" />
              </button>
            ))}
          </div>
        </ControlBlock>

        {activeTool !== "pencil" && activeTool !== "text" && (
          <ControlBlock label="Stroke Style">
            <div className="grid grid-cols-3 gap-2">
              {strokeStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setStrokeStyle(style)}
                  className={`rounded-md border px-2 py-1 text-xs capitalize transition-colors ${
                    strokeStyle === style
                      ? "border-blue-400/70 bg-blue-500/20 text-white"
                      : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </ControlBlock>
        )}

        <ControlBlock label={`Opacity ${Math.round(opacity * 100)}%`}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(Number.parseFloat(e.target.value))}
            className="w-full accent-blue-300"
          />
        </ControlBlock>

        {activeTool === "text" && (
          <ControlBlock label={`Font Size ${fontSize}px`}>
            <input
              type="range"
              min="12"
              max="72"
              step="2"
              value={fontSize}
              onChange={(e) => setFontSize(Number.parseInt(e.target.value, 10))}
              className="w-full accent-blue-300"
            />
          </ControlBlock>
        )}
      </div>
    </aside>
  )
}

const ControlBlock = ({ label, children }: { label: string; children: React.ReactNode }) => {
  return (
    <section>
      <p className="mb-2 text-xs uppercase tracking-wide text-white/60">{label}</p>
      {children}
    </section>
  )
}

const ColorIndicator = ({
  color,
  onClick,
  isActive,
  ariaLabel,
  transparent,
}: {
  color: string
  onClick: () => void
  isActive: boolean
  ariaLabel: string
  transparent?: boolean
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`h-6 w-6 rounded-md border transition-colors ${
        isActive
          ? "border-blue-300 shadow-[0_0_0_1px_rgba(147,197,253,0.65)]"
          : transparent
            ? "border-white/40"
            : "border-white/15 hover:border-white/30"
      }`}
      style={{ backgroundColor: color }}
    />
  )
}
