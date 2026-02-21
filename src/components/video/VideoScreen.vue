<script setup lang="ts">
import { inject, ref, computed, Ref } from "vue";
import type {
  TextContent,
  VoiceContent,
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
import { useVideoDrawing } from "../../assets/utils/useVideoDrawing";
import { useVideoElements } from "../../assets/utils/useVideoElements";

const { playbackControls } = inject("video") as VideoState;
const { isPlaying } = playbackControls;
const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice" | "delete"
>;
const activeColor = inject("activeColor") as Ref<string>;
const breakpointStore = inject("breakpointStore") as BreakpointHook;
const activeBreakpoint = breakpointStore.activeBreakpoint;

// State
const container = ref<HTMLElement | null>(null);

const {
  isDrawing,
  currentVector,
  drawingRef,
  finishDrawing,
  checkDrawingCollision,
} = useVideoDrawing(activeBreakpoint, breakpointStore);

const {
  isDeleting,
  itemRefs,
  setItemRef,
  deleteElement,
  performBufferedDeletion,
} = useVideoElements(
  activeBreakpoint,
  editing,
  container,
  checkDrawingCollision,
);

const elementX = ref(0);
const elementY = ref(0);
const isOutside = ref(true);

// Computed for vectors to ensure reactivity
const vectors = computed(() => {
  if (activeBreakpoint.value && activeBreakpoint.value.drawingContent) {
    return activeBreakpoint.value.drawingContent.content;
  }
  return [];
});

const handleDragStart = (e: MouseEvent, item: TextContent | VoiceContent) => {
  if (editing.value === "delete") return;
  const component = itemRefs.value[item.id] as any;
  let element = component && "$el" in component ? component.$el : component;

  // For notes, we want to constrain dragging based on the handle, not the full expanded note,
  // to allow the "flip" logic to work near boundaries without hitting an invisible wall.
  if (element instanceof HTMLElement) {
    const handle = element.querySelector(".drag-handle-container");
    if (handle) {
      element = handle;
    }
  }

  if (element && container.value) {
    startDrag(e, item, element, container.value);
  }
};

// Settings
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
      activeColor.value,
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
      <component
        :is="cursorIcon"
        class="icon"
        :style="{
          color: editing === 'draw' ? activeColor : 'white',
        }"
      />
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
          :style="{
            pointerEvents:
              editing === 'text' || editing === 'voice' || editing === 'draw'
                ? 'none'
                : 'auto',
          }"
          :ref="(el) => setItemRef(el as any, item.id)"
          v-model="(item as TextContent).content"
          :isCollapsed="(item as TextContent).isCollapsed"
          @update:isCollapsed="
            (val) => ((item as TextContent).isCollapsed = val)
          "
          :x="item.position.left"
          :y="item.position.top"
          :dimensions="item.dimensions"
          v-model:invertedX="(item as TextContent).invertedX"
          v-model:invertedY="(item as TextContent).invertedY"
          @dragStart="(e) => handleDragStart(e, item)"
          @update:dimensions="(dims) => (item.dimensions = dims)"
          @click.capture="deleteElement(item.id, 'text', $event)"
        />
      </template>
      <template v-if="activeBreakpoint.voiceContent">
        <VoiceNote
          v-for="item in activeBreakpoint.voiceContent"
          :key="item.id"
          :style="{
            pointerEvents:
              editing === 'text' || editing === 'voice' || editing === 'draw'
                ? 'none'
                : 'auto',
          }"
          :ref="(el) => setItemRef(el as any, item.id)"
          v-model="(item as VoiceContent).fileBlob"
          :isCollapsed="(item as VoiceContent).isCollapsed"
          @update:isCollapsed="
            (val) => ((item as VoiceContent).isCollapsed = val)
          "
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

.video-container.custom-cursor,
.video-container.custom-cursor :deep(*) {
  cursor: none !important;
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
