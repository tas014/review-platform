<script setup lang="ts">
import { inject, ref, computed, Ref, onMounted } from "vue";
import type {
  TextContent,
  VoiceContent,
  Vector,
} from "../../assets/interfaces/BreakpointType";
import VideoState from "../../assets/interfaces/VideoState";
import DrawIcon from "../icons/Draw.vue";
import TextIcon from "../icons/Text.vue";
import VoiceIcon from "../icons/Voice.vue";
import TextNote from "../analysis/elements/TextNote.vue";
import VoiceNote from "../analysis/elements/VoiceNote.vue";

// Utils
import { addTextNote } from "../../assets/utils/handleText";
import { addVoiceNote } from "../../assets/utils/handleVoice";
import {
  startDrawing,
  continueDrawing,
  stopDrawing,
  redraw,
} from "../../assets/utils/handleDraw";

const { playbackControls } = inject("video") as VideoState;
const { isPlaying } = playbackControls;
const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice"
>;

// State
const container = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

const elementX = ref(0);
const elementY = ref(0);
const isOutside = ref(true);

// Data
const items = ref<(TextContent | VoiceContent)[]>([]);
const vectors = ref<Vector[]>([]); // Current drawings

// Drawing state
const isDrawing = ref(false);
const currentVector = ref<Vector | null>(null);

// Settings
const strokeColor = "#FF0000";
const lineWidth = 3;

// Initialize canvas
onMounted(() => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
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
  }
};

const onMouseEnter = () => {
  isOutside.value = false;
};

const onMouseLeave = () => {
  isOutside.value = true;
  if (isDrawing.value) {
    stopDrawing(isDrawing, currentVector, vectors, localRedraw);
  }
};

const onMouseDown = () => {
  if (editing.value === "draw") {
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
  if (editing.value === "draw") {
    stopDrawing(isDrawing, currentVector, vectors, localRedraw);
  }
};

const handleClick = (e: MouseEvent) => {
  if (editing.value === "text") {
    addTextNote(e, container.value, items);
  } else if (editing.value === "voice") {
    addVoiceNote(e, container.value, items);
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
    <template v-for="item in items" :key="item.id">
      <TextNote
        v-if="item.type === 'text'"
        v-model="(item as TextContent).content"
        :x="item.position.left"
        :y="item.position.top"
      />
      <VoiceNote
        v-else-if="item.type === 'voice'"
        v-model="(item as VoiceContent).fileBlob"
        :x="item.position.left"
        :y="item.position.top"
      />
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
