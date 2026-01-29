import { Tool } from "./Canvas";
import { IconButton } from "./IconButton";
import { 
  Circle, 
  Pencil, 
  RectangleHorizontalIcon, 
  ArrowUpRight, 
  Type, 
  Download,
  Eraser
} from "lucide-react";

export function MainSidebar({
  selectedTool,
  setSelectedTool,
  onExport
}: {
  selectedTool: Tool;
  setSelectedTool: (t: Tool) => void;
  onExport: () => void;
}) {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col gap-2 p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl transition-all duration-300 hover:bg-white/15">
        <IconButton
          onClick={() => setSelectedTool("pencil")}
          activated={selectedTool === "pencil"}
          icon={<Pencil className="w-5 h-5" />}
        />
        <IconButton
          onClick={() => setSelectedTool("rect")}
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontalIcon className="w-5 h-5" />}
        />
        <IconButton
          onClick={() => setSelectedTool("circle")}
          activated={selectedTool === "circle"}
          icon={<Circle className="w-5 h-5" />}
        />
        <IconButton
          onClick={() => setSelectedTool("arrow")}
          activated={selectedTool === "arrow"}
          icon={<ArrowUpRight className="w-5 h-5" />}
        />
        <IconButton
          onClick={() => setSelectedTool("text")}
          activated={selectedTool === "text"}
          icon={<Type className="w-5 h-5" />}
        />
        <IconButton
          onClick={() => setSelectedTool("eraser")}
          activated={selectedTool === "eraser"}
          icon={<Eraser className="w-5 h-5" />}
        />
        <div className="h-px bg-white/20 my-1" />
        <IconButton
          onClick={onExport}
          activated={false}
          icon={<Download className="w-5 h-5" />}
        />
      </div>
    </div>
  );
}
