import { bgFill, strokeFill, strokeWidth, Tool, StrokeStyle } from "@/canvas/Canvas";
import React from "react";
import { Separator } from "./ui/separator";

interface SidebarProps {
    activeTool: Tool;
    strokeFill: strokeFill;
    setStrokeFill: React.Dispatch<React.SetStateAction<strokeFill>>;
    strokeWidth: strokeWidth;
    setStrokeWidth: React.Dispatch<React.SetStateAction<strokeWidth>>;
    bgFill: bgFill;
    setBgFill: React.Dispatch<React.SetStateAction<bgFill>>;
    opacity: number;
    setOpacity: React.Dispatch<React.SetStateAction<number>>;
    strokeStyle: StrokeStyle;
    setStrokeStyle: React.Dispatch<React.SetStateAction<StrokeStyle>>;
    fontSize: number;
    setFontSize: React.Dispatch<React.SetStateAction<number>>;
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
    ];

    const strokeWidths: strokeWidth[] = [1, 2, 4]

    const bgFills: bgFill[] = [
        "rgba(0, 0, 0, 0)",
        "rgba(89, 49, 49)",
        "rgba(23, 61, 16)",
        "rgba(30, 70, 101)",
        "rgba(49, 37, 7)",
    ];

    const strokeStyles: StrokeStyle[] = ["solid", "dashed", "dotted"];

    if(activeTool === "erase" || activeTool === "grab" || activeTool === "select"){
        return ;
    }

    return (
        <div className="fixed left-10 top-[50%] bg-[#232329] px-3 py-4 rounded-md -translate-y-[50%] w-fit max-h-[80vh] overflow-y-auto text-white z-40">
            <div className="flex flex-col gap-4 justify-start items-start w-full">
                {/* Stroke Color */}
                <div>
                <p className="text-sm text-white/70 mb-2">Stroke</p>
                <div className="flex gap-2 h-7 items-center flex-wrap max-w-[200px]">
                    {strokeFills.map((fill, index) => (
                        <ColorFillIndicator
                            key={index}
                            color={fill}
                            onClick={() => setStrokeFill(fill)}
                            isActive={strokeFill === fill}
                        />
                    ))}
                </div>
                </div>

                {/* Background Color - only for shapes with fill */}
                {(activeTool === "rect" || activeTool === "ellipse" || activeTool === "diamond" || activeTool === "triangle") && (
                    <div>
                    <p className="text-sm text-white/70 mb-2">Background</p>
                    <div className="flex gap-2 h-7 items-center flex-wrap max-w-[200px]">
                        {bgFills.map((fill, index) => (
                            <ColorBgIndicator
                                key={index}
                                color={fill}
                                onClick={() => setBgFill(fill)}
                                isActive={bgFill === fill}
                            />
                        ))}
                    </div>
                    </div>
                )}

                {/* Stroke Width */}
                <div>
                <p className="text-sm text-white/70 mb-2">Stroke Width</p>
                <div className="flex gap-2 h-7 items-center">
                    {strokeWidths.map((width, index) => (
                        <StrokeWidthIndicator
                            key={index}
                            strokeWidth={width}
                            onClick={() => setStrokeWidth(width)}
                            isActive={strokeWidth === width}
                        />
                    ))}
                </div>
                </div>

                {/* Stroke Style */}
                {activeTool !== "pencil" && activeTool !== "text" && (
                    <div>
                    <p className="text-sm text-white/70 mb-2">Stroke Style</p>
                    <div className="flex gap-2">
                        {strokeStyles.map((style) => (
                            <button
                                key={style}
                                onClick={() => setStrokeStyle(style)}
                                className={`px-3 py-1 rounded text-xs capitalize ${
                                    strokeStyle === style 
                                        ? "bg-white/20 text-white" 
                                        : "bg-white/5 text-white/60 hover:bg-white/10"
                                }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                    </div>
                )}

                {/* Opacity */}
                <div className="w-full">
                <p className="text-sm text-white/70 mb-2">Opacity: {Math.round(opacity * 100)}%</p>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-white"
                />
                </div>

                {/* Font Size - only for text tool */}
                {activeTool === "text" && (
                    <div className="w-full">
                    <p className="text-sm text-white/70 mb-2">Font Size: {fontSize}px</p>
                    <input
                        type="range"
                        min="12"
                        max="72"
                        step="2"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full accent-white"
                    />
                    </div>
                )}
            </div>
        </div>
    );
};

const ColorFillIndicator = ({
    color,
    onClick,
    isActive,
}: {
    color: strokeFill;
    onClick?: () => void;
    isActive?: boolean;
}) => {
    return (
        <div
            className={`w-[1.4rem] h-[1.4rem] rounded-sm cursor-pointer hover:border-2 transition-all ${
                isActive ? "border-2 border-white" : "border border-white/30"
            }`}
            style={{ backgroundColor: color }}
            onClick={onClick}
        >
            
        </div>
    );
};

const ColorBgIndicator = ({
    color,
    onClick,
    isActive,
}: {
    color: bgFill;
    onClick?: () => void;
    isActive?: boolean;
}) => {
    return (
        <div
       className={`w-[1.4rem] h-[1.4rem] rounded-sm cursor-pointer hover:border-2 transition-all ${
           isActive ? "border-2 border-white" : 
           color === "rgba(0, 0, 0, 0)" ? "border border-white/30" : "border border-white/10"
       }`}
           style={{ backgroundColor: color }}
            onClick={onClick}
        ></div>
    );
};


const StrokeWidthIndicator = ({
    strokeWidth, 
    onClick,
    isActive
}: {
    strokeWidth: strokeWidth, 
    onClick?: () => void,
    isActive?: boolean
}) => {
   return <div
    className={`w-[1.4rem] h-[1.4rem] rounded-sm cursor-pointer transition-all flex items-center ${
        isActive ? "border-2 border-white" : "border border-white/10 hover:border-white/30"
    }`}
         onClick={onClick}
     >
        <div
                style={{ height: `${strokeWidth}px` }}
                className="w-full bg-white/80"
            />
    </div>
}
