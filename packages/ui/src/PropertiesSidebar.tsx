import { Tool } from "./Canvas";
import { Settings2, X } from "lucide-react";
import { useState } from "react";

export function PropertiesSidebar({
  selectedTool,
  isOpen,
  setIsOpen
}: {
  selectedTool: Tool;
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
}) {
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-4 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all shadow-lg"
      >
        <Settings2 className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed right-4 top-4 bottom-4 w-72 z-50 animate-in slide-in-from-right duration-300">
      <div className="h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-white shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Properties
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block uppercase tracking-wider font-bold">Tool</label>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl capitalize font-medium">
              {selectedTool}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block uppercase tracking-wider font-bold">Stroke Color</label>
            <div className="flex gap-2">
              <ColorCircle color="#ffffff" active />
              <ColorCircle color="#ff4d4d" />
              <ColorCircle color="#4dff88" />
              <ColorCircle color="#4da6ff" />
              <ColorCircle color="#ffff4d" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block uppercase tracking-wider font-bold">Opacity</label>
            <input 
              type="range" 
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" 
            />
          </div>
        </div>

        <div className="mt-auto p-4 bg-gradient-to-br from-white/10 to-transparent border border-white/5 rounded-2xl">
          <p className="text-xs text-gray-400 leading-relaxed">
            Configure {selectedTool} settings here. More advanced options coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}

function ColorCircle({ color, active }: { color: string, active?: boolean }) {
  return (
    <div 
      className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 border-2 ${active ? 'border-white shrink-0 scale-110' : 'border-transparent'}`}
      style={{ backgroundColor: color }}
    />
  );
}
