import { useState } from "react";
import {
  Pencil,
  Eraser,
  Trash2,
  PaintBucket,
  Minus,
  Plus
} from "lucide-react";

function Toolbar({
  color,
  setColor,
  brushSize,
  setBrushSize,
  tool,
  setTool,
  clearCanvas,
  fillCanvas
}) {

  const colors = [
    "#000000",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ffffff"
  ];

  return (
    <div className="w-full bg-base-200 rounded-2xl shadow-xl p-4 mb-4 border border-base-300">

      {/* TOP SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        {/* TOOLS */}
        <div className="flex items-center gap-3">

          {/* PEN */}
          <button
            onClick={() => setTool("pen")}
            className={`btn btn-sm rounded-xl ${
              tool === "pen"
                ? "btn-primary"
                : "btn-ghost"
            }`}
          >
            <Pencil size={18} />
            Pen
          </button>

          {/* ERASER */}
          <button
            onClick={() => setTool("eraser")}
            className={`btn btn-sm rounded-xl ${
              tool === "eraser"
                ? "btn-error"
                : "btn-ghost"
            }`}
          >
            <Eraser size={18} />
            Eraser
          </button>

          {/* FILL */}
          <button
            onClick={fillCanvas}
            className="btn btn-sm btn-warning rounded-xl"
          >
            <PaintBucket size={18} />
            Fill
          </button>

          {/* CLEAR */}
          <button
            onClick={clearCanvas}
            className="btn btn-sm btn-error rounded-xl"
          >
            <Trash2 size={18} />
            Clear
          </button>

        </div>

        {/* BRUSH SIZE */}
        <div className="flex items-center gap-3 bg-base-100 px-4 py-2 rounded-xl shadow-inner">

          <button
            className="btn btn-circle btn-xs"
            onClick={() =>
              setBrushSize((prev) =>
                Math.max(1, prev - 1)
              )
            }
          >
            <Minus size={14} />
          </button>

          <div className="text-sm font-bold">
            {brushSize}px
          </div>

          <button
            className="btn btn-circle btn-xs"
            onClick={() =>
              setBrushSize((prev) =>
                Math.min(50, prev + 1)
              )
            }
          >
            <Plus size={14} />
          </button>

        </div>

      </div>

      {/* COLOR SECTION */}
      <div className="mt-5">

        <h3 className="font-bold mb-3 text-sm opacity-70">
          Colors
        </h3>

        <div className="flex flex-wrap gap-3">

          {colors.map((item) => (

            <button
              key={item}
              onClick={() => setColor(item)}
              className={`w-10 h-10 rounded-full border-4 transition-all duration-200 hover:scale-110 ${
                color === item
                  ? "border-white scale-110"
                  : "border-base-300"
              }`}
              style={{
                backgroundColor: item
              }}
            />

          ))}

        </div>

      </div>

      {/* BRUSH PREVIEW */}
      <div className="mt-6 flex items-center gap-4">

        <h3 className="font-bold text-sm opacity-70">
          Preview
        </h3>

        <div
          className="rounded-full border border-base-300"
          style={{
            width: `${brushSize}px`,
            height: `${brushSize}px`,
            backgroundColor:
              tool === "eraser"
                ? "#ffffff"
                : color
          }}
        />

      </div>

    </div>
  );
}

export default Toolbar;