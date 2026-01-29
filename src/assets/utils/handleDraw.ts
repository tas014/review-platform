import { Ref } from "vue";
import type { Vector } from "../interfaces/BreakpointType";

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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw defined vectors
  vectors.forEach((vector) => {
    drawVector(ctx, vector);
  });

  // Draw vector in progress
  if (currentVector) {
    drawVector(ctx, currentVector);
  }
};

const drawVector = (ctx: CanvasRenderingContext2D, vector: Vector) => {
  if (vector.line.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = vector.color;
  ctx.lineWidth = vector.lineWidth;
  ctx.lineCap = vector.lineCap;

  ctx.moveTo(vector.line[0].x, vector.line[0].y);
  for (let i = 1; i < vector.line.length; i++) {
    ctx.lineTo(vector.line[i].x, vector.line[i].y);
  }
  ctx.stroke();
};

export { startDrawing, continueDrawing, stopDrawing, redraw, drawVector };
