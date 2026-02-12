import { Ref } from "vue";
import type { Vector, Point } from "../interfaces/BreakpointType";

const startDrawing = (
  x: number,
  y: number,
  strokeColor: string,
  lineWidth: number,
  isDrawing: Ref<boolean>,
  currentVector: Ref<Vector | null>,
) => {
  isDrawing.value = true;
  currentVector.value = {
    line: [{ x, y }],
    color: strokeColor,
    lineWidth: lineWidth,
    lineCap: "round",
  };
};

const continueDrawing = (
  x: number,
  y: number,
  currentVector: Ref<Vector | null>,
  redrawFn: () => void,
) => {
  if (currentVector.value) {
    currentVector.value.line.push({ x, y });
    redrawFn();
  }
};

const stopDrawing = (
  isDrawing: Ref<boolean>,
  currentVector: Ref<Vector | null>,
  vectors: Ref<Vector[]>,
  redrawFn: () => void,
) => {
  if (isDrawing.value && currentVector.value) {
    vectors.value.push(currentVector.value);
    currentVector.value = null;
    isDrawing.value = false;
    redrawFn();
  }
};

const redraw = (
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement | null,
  vectors: Vector[],
  currentVector: Vector | null,
) => {
  if (!ctx || !canvas) return;
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // Draw defined vectors
  vectors.forEach((vector) => {
    drawVector(ctx, vector, width, height);
  });

  // Draw vector in progress
  if (currentVector) {
    drawVector(ctx, currentVector, width, height);
  }
};

const drawVector = (
  ctx: CanvasRenderingContext2D,
  vector: Vector,
  width: number,
  height: number,
) => {
  if (vector.line.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = vector.color;
  ctx.lineWidth = vector.lineWidth; // Keep stroke width constant as requested
  ctx.lineCap = vector.lineCap;

  // Scale coordinates: normalized (0-1) -> pixels
  ctx.moveTo(vector.line[0].x * width, vector.line[0].y * height);
  for (let i = 1; i < vector.line.length; i++) {
    ctx.lineTo(vector.line[i].x * width, vector.line[i].y * height);
  }
  ctx.stroke();
};

export { startDrawing, continueDrawing, stopDrawing, redraw, drawVector };
