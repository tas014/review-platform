<script setup lang="ts">
import { inject, ref, computed, Ref, onMounted, onUnmounted, watch } from "vue";
import type {
  TextContent,
  VoiceContent,
  Vector,
  BreakpointHook,
} from "../../assets/interfaces/BreakpointType";
import VideoState from "../../assets/interfaces/VideoState";
import DrawIcon from "../icons/Draw.vue";
import TextIcon from "../icons/Text.vue";
import VoiceIcon from "../icons/Voice.vue";
import TextNote from "../analysis/elements/TextNote.vue";
import VoiceNote from "../analysis/elements/VoiceNote.vue";
import DeleteIcon from "../icons/Delete.vue";

// Utils
import {
  startDrawing,
  continueDrawing,
  redraw,
} from "../../assets/utils/handleDraw";
import { startDrag } from "../../assets/utils/handleDrag";

const { playbackControls } = inject("video") as VideoState;
const { isPlaying } = playbackControls;
const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice" | "delete"
>;
const breakpointStore = inject("breakpointStore") as BreakpointHook;
const activeBreakpoint = breakpointStore.activeBreakpoint;

// State
const container = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
let resizeObserver: ResizeObserver | null = null;

const elementX = ref(0);
const elementY = ref(0);
const isOutside = ref(true);

// Data
const itemRefs = ref<Record<number, any>>({});

// Computed for vectors to ensure reactivity
const vectors = computed(() => {
  if (activeBreakpoint.value && activeBreakpoint.value.drawingContent) {
    return activeBreakpoint.value.drawingContent.content;
  }
  return [];
});

// Dragging
const setItemRef = (el: any, id: number) => {
  if (el) {
    itemRefs.value[id] = el;
  }
};

const handleDragStart = (e: MouseEvent, item: TextContent | VoiceContent) => {
  if (editing.value === "delete") return;
  const component = itemRefs.value[item.id];
  const element = component?.$el || component;
  if (element && container.value) {
    startDrag(e, item, element, container.value);
  }
};

const isDeleting = ref(false);

const deleteElement = (
  id: number,
  type: "text" | "voice",
  event?: MouseEvent, // Make event optional for programmatic deletion
) => {
  if (editing.value === "delete" && activeBreakpoint.value) {
    if (event) event.stopPropagation();
    if (type === "text" && activeBreakpoint.value.textContent) {
      activeBreakpoint.value.textContent =
        activeBreakpoint.value.textContent.filter((t) => t.id !== id);
    } else if (type === "voice" && activeBreakpoint.value.voiceContent) {
      activeBreakpoint.value.voiceContent =
        activeBreakpoint.value.voiceContent.filter((v) => v.id !== id);
    }
  }
};

// Drawing state
const isDrawing = ref(false);
const currentVector = ref<Vector | null>(null);

// Settings
const strokeColor = "#FF0000";
const lineWidth = 3;

// Initialize canvas
onMounted(() => {
  if (canvas.value && container.value) {
    ctx.value = canvas.value.getContext("2d");

    // Initial resize
    resizeCanvas();

    // Observe container for size changes
    resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

const resizeCanvas = () => {
  if (container.value && canvas.value) {
    const rect = container.value.getBoundingClientRect();
    canvas.value.width = rect.width;
    canvas.value.height = rect.height;
    localRedraw();
  }
};

const localRedraw = () => {
  redraw(ctx.value, canvas.value, vectors.value, currentVector.value);
};

// Watch for breakpoint changes to redraw canvas
watch(
  () => activeBreakpoint.value,
  () => {
    localRedraw();
  },
  { deep: true },
);

const updateMousePosition = (e: MouseEvent) => {
  if (container.value) {
    const rect = container.value.getBoundingClientRect();
    elementX.value = e.clientX - rect.left;
    elementY.value = e.clientY - rect.top;

    if (editing.value === "draw" && isDrawing.value) {
      continueDrawing(
        elementX.value,
        elementY.value,
        currentVector,
        localRedraw,
      );
    }

    if (editing.value === "delete" && isDeleting.value) {
      performBufferedDeletion(elementX.value, elementY.value);
    }
  }
};

// Throttle deletion checks slightly if needed, but direct check is usually fine for reasonable note counts.
const performBufferedDeletion = (x: number, y: number) => {
  // 1. Check Drawings
  checkDrawingCollision(x, y);

  // 2. Check Notes via Refs
  for (const id in itemRefs.value) {
    const component = itemRefs.value[id];
    // Notes can be generic components; get element
    const el = component?.$el || component;
    if (el instanceof HTMLElement) {
      const rect = el.getBoundingClientRect();
      // Check if point within rect (transforming mouse to global or rect to local?
      // x/y are relative to container. rect is global.
      // Easier to use global clientX/Y from event?
      // updateMousePosition calculates relative X/Y.
      // Let's use relative check:

      if (!container.value) continue;
      const containerRect = container.value.getBoundingClientRect();
      const elLeft = rect.left - containerRect.left;
      const elTop = rect.top - containerRect.top;

      if (
        x >= elLeft &&
        x <= elLeft + rect.width &&
        y >= elTop &&
        y <= elTop + rect.height
      ) {
        // Determine type based on props or id presence in activeBreakpoint lists
        // We need to map ID back to type.
        // A cleaner way is to store type in refs or check separate lists.
        // We iterated itemRefs. Let's check matching ID in lists.

        if (
          activeBreakpoint.value?.textContent?.some((t) => t.id === Number(id))
        ) {
          deleteElement(Number(id), "text");
        } else if (
          activeBreakpoint.value?.voiceContent?.some((v) => v.id === Number(id))
        ) {
          deleteElement(Number(id), "voice");
        }
      }
    }
  }
};

const checkDrawingCollision = (x: number, y: number) => {
  if (activeBreakpoint.value?.drawingContent && ctx.value) {
    const content = activeBreakpoint.value.drawingContent.content;
    for (let i = content.length - 1; i >= 0; i--) {
      const vector = content[i];
      const path = new Path2D();
      if (vector.line.length > 0) {
        path.moveTo(vector.line[0].x, vector.line[0].y);
        for (let j = 1; j < vector.line.length; j++) {
          path.lineTo(vector.line[j].x, vector.line[j].y);
        }
      }
      ctx.value.lineWidth = 10;
      if (ctx.value.isPointInStroke(path, x, y)) {
        activeBreakpoint.value.drawingContent.content.splice(i, 1);
        localRedraw();
        return; // Delete one at a time per frame is smoother visually? or maybe allowed to delete multiple.
      }
    }
  }
};

const onMouseEnter = () => {
  isOutside.value = false;
};

const onMouseLeave = () => {
  isOutside.value = true;
  isDeleting.value = false;
  if (isDrawing.value) {
    // Custom stop drawing logic to handle store interaction
    finishDrawing();
  }
};

const onMouseDown = () => {
  if (editing.value === "delete") {
    isDeleting.value = true;
    // Also perform immediate check
    performBufferedDeletion(elementX.value, elementY.value);
  }

  if (editing.value === "draw" && activeBreakpoint.value) {
    startDrawing(
      elementX.value,
      elementY.value,
      strokeColor,
      lineWidth,
      isDrawing,
      currentVector,
    );
  }
};

const onMouseUp = () => {
  isDeleting.value = false;
  if (editing.value === "draw") {
    finishDrawing();
  }
};

const finishDrawing = () => {
  if (isDrawing.value && currentVector.value && activeBreakpoint.value) {
    if (!activeBreakpoint.value.drawingContent) {
      breakpointStore.createDrawingContent(
        activeBreakpoint.value.timeStamp,
        [], // content starts empty, we push next
        { top: 0, left: 0 },
        { width: canvas.value?.width || 0, height: canvas.value?.height || 0 },
      );
    }

    if (activeBreakpoint.value.drawingContent) {
      activeBreakpoint.value.drawingContent.content.push(currentVector.value);
    }

    currentVector.value = null;
    isDrawing.value = false;
    localRedraw();
  } else {
    currentVector.value = null;
    isDrawing.value = false;
    localRedraw();
  }
};

const handleClick = (e: MouseEvent) => {
  if (!container.value || !activeBreakpoint.value) return;

  const rect = container.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const xPercent = Number(((x / rect.width) * 100).toFixed(2));
  const yPercent = Number(((y / rect.height) * 100).toFixed(2));

  const position = { left: xPercent, top: yPercent };
  const dimensions = { width: 30, height: 20 };

  if (editing.value === "delete") {
    // Click deletion is now also handled by drag/mousedown logic, but keeping the check unified or redundant is fine.
    // Actually, handleClick fires AFTER mouseUp. If we deleted on mouseDown/Move, element might be gone.
    // checkDrawingCollision(x, y); would delete it.
    // Since we handle onMouseDown => delete, standard click might hit empty space.
    // Let's refactor handleClick to use same function just in case, or just rely on mouse handlers.
    // Relying on mouse handlers covers "Click" (since it involves mousedown).
    // So we can remove the specialized block here?
    // User requested "holding down left click", so drag-to-delete.
    // Standard click is just a short drag.
    // safe to leave empty or call check once.
    checkDrawingCollision(x, y);
    return;
  }

  if (editing.value === "text") {
    breakpointStore.createTextContent(
      activeBreakpoint.value.timeStamp,
      "",
      position,
      dimensions,
    );
  } else if (editing.value === "voice") {
    breakpointStore.createVoiceContent(
      activeBreakpoint.value.timeStamp,
      new Blob(), // Placeholder blob
      position,
      dimensions,
      0,
    );
  }
};

const cursorIcon = computed(() => {
  switch (editing.value) {
    case "draw":
      return DrawIcon;
    case "text":
      return TextIcon;
    case "voice":
      return VoiceIcon;
    case "delete":
      return DeleteIcon;
    default:
      return null;
  }
});

const showCursor = computed(() => {
  return (
    editing.value !== null &&
    editing.value !== "trim" &&
    !isOutside.value &&
    cursorIcon.value
  );
});

const cursorStyle = computed(() => ({
  left: `${elementX.value}px`,
  top: `${elementY.value}px`,
  display: activeBreakpoint.value ? "block" : "none", // Hide cursor if no breakpoint? user said: "no elements should be rendered". Maybe cursor is fine. But user said "no text, voice or drawings". Cursor is UI.
}));
</script>

<template>
  <div
    ref="container"
    :class="[
      'video-container',
      { playing: isPlaying, 'custom-cursor': showCursor },
    ]"
    @mousemove="updateMousePosition"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @click="handleClick"
  >
    <div v-if="showCursor" class="cursor-follower" :style="cursorStyle">
      <component :is="cursorIcon" class="icon" />
    </div>

    <!-- Canvas for Drawing -->
    <canvas ref="canvas" class="drawing-canvas"></canvas>

    <!-- Notes -->
    <template v-if="activeBreakpoint">
      <template v-if="activeBreakpoint.textContent">
        <TextNote
          v-for="item in activeBreakpoint.textContent"
          :key="item.id"
          :ref="(el) => setItemRef(el, item.id)"
          v-model="(item as TextContent).content"
          :x="item.position.left"
          :y="item.position.top"
          :dimensions="item.dimensions"
          @dragStart="(e) => handleDragStart(e, item)"
          @update:dimensions="(dims) => (item.dimensions = dims)"
          @click.capture="deleteElement(item.id, 'text', $event)"
        />
      </template>
      <template v-if="activeBreakpoint.voiceContent">
        <VoiceNote
          v-for="item in activeBreakpoint.voiceContent"
          :key="item.id"
          :ref="(el) => setItemRef(el, item.id)"
          v-model="(item as VoiceContent).fileBlob"
          :x="item.position.left"
          :y="item.position.top"
          @dragStart="(e) => handleDragStart(e, item)"
          @click.capture="deleteElement(item.id, 'voice', $event)"
        />
      </template>
    </template>

    <slot name="video"></slot>
  </div>
</template>

<style scoped>
.video-container {
  height: 70vh;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.playing {
  box-sizing: border-box;
  border: solid 3px var(--light-green);
}

.video-container.custom-cursor {
  cursor: none;
}

.cursor-follower {
  position: absolute;
  pointer-events: none;
  color: white;
  transform: translate(-50%, -50%); /* Center the icon on cursor */
  z-index: 100;
}

.icon {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.8));
}

.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let clicks pass through to container handlers */
  z-index: 10;
}
</style>
