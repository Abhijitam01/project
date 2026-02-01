import { Tool } from "@/canvas/Canvas"

interface ToolProps{
    tool: string
    icon: React.ReactNode
    shortcut: string
    onClick: () => void
    active: boolean
}

export const ToolButton = ({tool, icon,shortcut,onClick, active}: ToolProps) => {
return <div onClick={onClick} className={` p-1 hover:bg-[#31303B] transition-all text-white/30 cursor-pointer relative rounded-md  
     ${active ? "bg-[#403E6A] hover:bg-[#3e3c6a] text-white/70" : ""}`} >
        <div className="scale-[0.7] m-1">{icon}</div>
        <p className="absolute -bottom-1 right-1 scale-[0.7] text-[10px]">{shortcut}</p>
    </div>
}