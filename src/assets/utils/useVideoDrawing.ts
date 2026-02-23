import { ref, type Ref } from "vue";
import type Breakpoint from "../interfaces/BreakpointType";
import type { Vector } from "../interfaces/BreakpointType";
import type { BreakpointHook } from "../interfaces/BreakpointType";

export function useVideoDrawing(
  activeBreakpoint: Ref<Breakpoint | null>,
  breakpointStore: BreakpointHook,
) {
  const isDrawing = ref(false);
  const currentVector = ref<Vector | null>(null);

  const drawingRef = ref<any | null>(null);

  const finishDrawing = () => {
    if (isDrawing.value && currentVector.value && activeBreakpoint.value) {
      if (!activeBreakpoint.value.drawingContent) {
        breakpointStore.createDrawingContent(
          activeBreakpoint.value.timeStamp,
          [],
          { top: 0, left: 0 },
          { width: 0, height: 0 },
        );
      }

      if (activeBreakpoint.value.drawingContent) {
        activeBreakpoint.value.drawingContent.content.push(currentVector.value);
      }

      currentVector.value = null;
      isDrawing.value = false;
    } else {
      currentVector.value = null;
      isDrawing.value = false;
    }
  };

  const checkDrawingCollision = (x: number, y: number) => {
    if (activeBreakpoint.value?.drawingContent && drawingRef.value) {
      const index = drawingRef.value.checkCollision(x, y);
      if (index !== -1) {
        activeBreakpoint.value.drawingContent.content.splice(index, 1);
      }
    }
  };

  return {
    isDrawing,
    currentVector,
    drawingRef,
    finishDrawing,
    checkDrawingCollision,
  };
}
