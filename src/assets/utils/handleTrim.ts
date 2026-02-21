interface TrimDragState {
  isDraggingStart: boolean;
  isDraggingEnd: boolean;
  container: HTMLElement | null;
  trimStartPercent: number;
  trimEndPercent: number;
  emit: any;
}

const dragState: TrimDragState = {
  isDraggingStart: false,
  isDraggingEnd: false,
  container: null,
  trimStartPercent: 0,
  trimEndPercent: 100,
  emit: null,
};

export const startTrimDrag = (
  type: "start" | "end",
  container: HTMLElement | null,
  trimStartPercent: number,
  trimEndPercent: number,
  emit: any,
) => {
  if (!container) return;

  dragState.isDraggingStart = type === "start";
  dragState.isDraggingEnd = type === "end";
  dragState.container = container;
  dragState.trimStartPercent = trimStartPercent;
  dragState.trimEndPercent = trimEndPercent;
  dragState.emit = emit;

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!dragState.container || !dragState.emit) return;

  const rect = dragState.container.getBoundingClientRect();
  let percent = ((e.clientX - rect.left) / rect.width) * 100;

  // Clamp 0-100
  percent = Math.max(0, Math.min(100, percent));

  if (dragState.isDraggingStart) {
    // Prevent crossing end
    percent = Math.min(percent, dragState.trimEndPercent - 1);
    dragState.trimStartPercent = percent;
    dragState.emit("update:trimStartPercent", percent);
  } else if (dragState.isDraggingEnd) {
    // Prevent crossing start
    percent = Math.max(percent, dragState.trimStartPercent + 1);
    dragState.trimEndPercent = percent;
    dragState.emit("update:trimEndPercent", percent);
  }
};

const handleMouseUp = () => {
  dragState.isDraggingStart = false;
  dragState.isDraggingEnd = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
};

export const cleanupTrimDrag = () => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
};
