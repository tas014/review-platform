import { TextContent, VoiceContent } from "../interfaces/BreakpointType";

interface DragState {
  isDragging: boolean;
  startMouseX: number;
  startMouseY: number;
  startItemLeft: number;
  startItemTop: number;
  item: TextContent | VoiceContent | null;
  elementWidthPercent: number;
  elementHeightPercent: number;
  containerWidth: number;
  containerHeight: number;
}

let dragState: DragState = {
  isDragging: false,
  startMouseX: 0,
  startMouseY: 0,
  startItemLeft: 0,
  startItemTop: 0,
  item: null,
  elementWidthPercent: 0,
  elementHeightPercent: 0,
  containerWidth: 0, // Cache these on drag start
  containerHeight: 0,
};

export const startDrag = (
  e: MouseEvent,
  item: TextContent | VoiceContent,
  draggedElement: HTMLElement,
  container: HTMLElement,
) => {
  e.stopPropagation();

  const containerRect = container.getBoundingClientRect();
  const elementRect = draggedElement.getBoundingClientRect();

  dragState = {
    isDragging: true,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    startItemLeft: item.position.left,
    startItemTop: item.position.top,
    item: item,
    elementWidthPercent: (elementRect.width / containerRect.width) * 100,
    elementHeightPercent: (elementRect.height / containerRect.height) * 100,
    containerWidth: containerRect.width,
    containerHeight: containerRect.height,
  };

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!dragState.isDragging || !dragState.item) return;

  const deltaX = e.clientX - dragState.startMouseX;
  const deltaY = e.clientY - dragState.startMouseY;

  const deltaXPercent = (deltaX / dragState.containerWidth) * 100;
  const deltaYPercent = (deltaY / dragState.containerHeight) * 100;

  let newLeft = dragState.startItemLeft + deltaXPercent;
  let newTop = dragState.startItemTop + deltaYPercent;

  // Rubberbanding / Clamping
  // Left constraint
  if (newLeft < 0) newLeft = 0;
  // Right constraint
  if (newLeft + dragState.elementWidthPercent > 100) {
    newLeft = 100 - dragState.elementWidthPercent;
  }
  // Top constraint
  if (newTop < 0) newTop = 0;
  // Bottom constraint
  if (newTop + dragState.elementHeightPercent > 100) {
    newTop = 100 - dragState.elementHeightPercent;
  }

  dragState.item.position.left = newLeft;
  dragState.item.position.top = newTop;
};

const handleMouseUp = () => {
  dragState.isDragging = false;
  dragState.item = null;
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
};
