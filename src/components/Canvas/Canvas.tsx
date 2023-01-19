import React, {useRef, useEffect, useState} from "react";
import "./Canvas.scss";
import PickerSquare from "./../PickerSquare/PickerSquare";
import {ColorMatrix, Position} from "../../structures/geometry";
import {ZOOM_RECT_SIZE} from "../../structures/constants";

export default function Canvas(props: {
  setColor: (color: string) => void,
}) {
  const canvas = useRef<HTMLCanvasElement>();
  const ctx = useRef<null | CanvasRenderingContext2D>();

  const [position, setPosition] = useState<Position>({x: 0, y: 0});

  const initCanvas = (): void => {
    canvas.current = document.getElementById("canvas") as HTMLCanvasElement;
    ctx.current = canvas.current.getContext("2d");
    if (!ctx.current) {
      alert("Failed to init canvas.");
    }
  }

  const drawImage = (): void => {
    if (!ctx.current) {
      return;
    }
    const img = document.getElementById("img") as HTMLImageElement;
    ctx.current.canvas.width = img.width;
    ctx.current.canvas.height = img.height;

    img.onload = () => {
      ctx.current?.drawImage(img, 0, 0);
    }
  }

  useEffect(() => {
    initCanvas();
    drawImage();
  }, []);

  // TODO consider size of the PickerSquare 120px
  const getPosition = (event: React.MouseEvent): Position => {
    if (!canvas.current) {
      return {x: 0, y: 0};
    }
    const clientRect = canvas.current.getBoundingClientRect();
    return {
      x: event.clientX - clientRect.left,
      y: event.clientY - clientRect.top,
    };
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    if (r > 255 || g > 255 || b > 255) {
      throw new Error("Invalid color component");
    }
    return ((r << 16) | (g << 8) | b).toString(16);
  }

  const getHexColor = (position: Position): string => {
    if (!ctx.current) {
      return "";
    }
    const colorData = ctx.current?.getImageData(position.x, position.y, 1, 1).data;
    return "#" + ("000000" + rgbToHex(colorData[0], colorData[1], colorData[2])).slice(-6);
  }

  const buildColorMatrix = (position: Position) => {
    const matrix: ColorMatrix = [];
    for (let i = 0; i < ZOOM_RECT_SIZE; ++i) {
      let row = [];
      for (let j = 0; j < ZOOM_RECT_SIZE; ++j) {
        row.push(getHexColor({
          x: position.x + i,
          y: position.y + j,
        }));
      }
      matrix.push(row);
    }
    return matrix;
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    const position = getPosition(event);
    setPosition(position);
    props.setColor(getHexColor(position));
  }

  return (
    <div className="Canvas">
      <canvas id="canvas" onMouseMove={handleMouseMove}></canvas>
      <img id="img" src="/img.jpg" width="1920" height="1080"/>
      <PickerSquare
        position={position}
        colorMatrix={buildColorMatrix(position)}
      />
    </div>
  );
}
