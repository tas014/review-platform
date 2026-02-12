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
import Drawing from "../analysis/elements/Drawing.vue";
import DeleteIcon from "../icons/Delete.vue";

// Utils
import { startDrawing, continueDrawing } from "../../assets/utils/handleDraw";
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
const drawingRef = refInstanceType(Drawing);

// Helper to type the ref correctly
function refInstanceType<T extends abstract new (...args: any) => any>(
  component: T,
) {
  return ref<InstanceType<T> | null>(null);
}

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

const updateMousePosition = (e: MouseEvent) => {
  if (container.value) {
    const rect = container.value.getBoundingClientRect();
    elementX.value = e.clientX - rect.left;
    elementY.value = e.clientY - rect.top;

    if (editing.value === "draw" && isDrawing.value) {
      // Normalize coordinates for storage
      const normX = elementX.value / rect.width;
      const normY = elementY.value / rect.height;

      // We pass a dummy redraw function because Drawing.vue watches the vectors
      // and schedules its own redraws.
      continueDrawing(
        normX,
        normY,
        currentVector,
        () => {}, // No-op, reactive watcher handles it
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
  if (activeBreakpoint.value?.drawingContent && drawingRef.value) {
    const index = drawingRef.value.checkCollision(x, y);
    if (index !== -1) {
      activeBreakpoint.value.drawingContent.content.splice(index, 1);
    }
  }
};

const onMouseEnter = () => {
  isOutside.value = false;
  // cursor logic handled by computed
};

const onMouseLeave = () => {
  isOutside.value = true;
  isDeleting.value = false;
  if (isDrawing.value) {
    finishDrawing();
  }
};

const onMouseDown = () => {
  if (editing.value === "delete") {
    isDeleting.value = true;
    performBufferedDeletion(elementX.value, elementY.value);
  }

  if (editing.value === "draw" && activeBreakpoint.value && container.value) {
    const rect = container.value.getBoundingClientRect();
    const normX = elementX.value / rect.width;
    const normY = elementY.value / rect.height;

    startDrawing(
      normX,
      normY,
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
  // If we have a vector in progress or we just came from isDrawing=true
  if (isDrawing.value && currentVector.value && activeBreakpoint.value) {
    if (!activeBreakpoint.value.drawingContent) {
      // Dimensions are now somewhat irrelevant given normalization,
      // but we maintain the shape of the data structure.
      // Top/Left 0 is fine, Width/Height can be arbitrary or 100% since we scale.
      breakpointStore.createDrawingContent(
        activeBreakpoint.value.timeStamp,
        [],
        { top: 0, left: 0 },
        { width: 0, height: 0 }, // Unused in normalized system
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
  display: activeBreakpoint.value ? "block" : "none",
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

    <!-- Drawing Component -->
    <Drawing
      v-if="activeBreakpoint"
      ref="drawingRef"
      :vectors="vectors"
      :current-vector="currentVector"
    />

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
</style>
