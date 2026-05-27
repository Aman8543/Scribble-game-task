import { useEffect, useRef, useState } from "react";

import socket from "../socket/socket";
import Toolbar from "./Toolbar";
import { Fullscreen } from "lucide-react";

function Canvas({ roomId , isDrawer}) {

  const canvasRef = useRef(null);

  const drawing = useRef(false);

  const [color, setColor] = useState("#000000");

  const [brushSize, setBrushSize] = useState(5);

  const [tool, setTool] = useState("pen");

  const lastPosition = useRef({
    x: 0,
    y: 0
  });

  useEffect(() => {

    const canvas = canvasRef.current;

if (!canvas) return;

const ctx = canvas.getContext("2d");

    ctx.lineCap = "round";

    ctx.lineJoin = "round";

    socket.on("drawing", (data) => {

      drawLine(data);

    });

    socket.on("clearCanvas", () => {

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

    });

    socket.on("fillCanvas", (fillColor) => {

      ctx.fillStyle = fillColor;

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

    });

    return () => {
      socket.off("drawing");
      socket.off("clearCanvas");
      socket.off("fillCanvas");
    };

  }, []);

  const drawLine = (data) => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = data.color;

    ctx.lineWidth = data.brushSize;

    ctx.beginPath();

    ctx.moveTo(data.prevX, data.prevY);

    ctx.lineTo(data.x, data.y);

    ctx.stroke();

  };

  const startDrawing = (e) => {

    drawing.current = true;

    const rect =
      canvasRef.current.getBoundingClientRect();

    lastPosition.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

  };

  const stopDrawing = () => {

    drawing.current = false;

  };

  const draw = (e) => {
      if (!isDrawer) return;
    if (!drawing.current) return;

    const rect =
      canvasRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;

    const y = e.clientY - rect.top;

    const data = {
      prevX: lastPosition.current.x,
      prevY: lastPosition.current.y,
      x,
      y,
      color:
        tool === "eraser"
          ? "#ffffff"
          : color,
      brushSize
    };

    drawLine(data);

    socket.emit("drawing", {
      roomId,
      data
    });

    lastPosition.current = { x, y };

  };

  const clearCanvas = () => {

    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    socket.emit("clearCanvas", roomId);

  };

  const fillCanvas = () => {

    const canvas = canvasRef.current;

if (!canvas) return;

const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    socket.emit("fillCanvas", {
      roomId,
      color
    });

  };

  return (
    <div className="w-full flex flex-col items-center">

      

      <div className="bg-base-200 p-4 rounded-3xl shadow-2xl border border-base-300">
      
         <canvas
          ref={canvasRef}
          width={600}
          height={500}
          className="bg-white rounded-2xl cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onMouseMove={draw}
        />
      
        

      </div>

     {isDrawer && (<Toolbar
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        tool={tool}
        setTool={setTool}
        clearCanvas={clearCanvas}
        fillCanvas={fillCanvas}
      />)
     }
      

    </div>
  );
}

export default Canvas;