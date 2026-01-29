import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean
}) {
    return (
        <button 
            className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center
                ${activated 
                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110" 
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`} 
            onClick={onClick}
        >
            {icon}
        </button>
    );
}
