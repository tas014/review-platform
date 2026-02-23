<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import type { Vector } from "../../../assets/interfaces/BreakpointType";
import { redraw, checkCollision } from "../../../assets/utils/handleDraw";

const props = defineProps<{
  vectors: Vector[];
  currentVector: Vector | null;
}>();

const container = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
let resizeObserver: ResizeObserver | null = null;
let rafId: number | null = null; // Request Animation Frame ID

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
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }
});

const resizeCanvas = () => {
  if (container.value && canvas.value) {
    const rect = container.value.getBoundingClientRect();
    // Set internal canvas resolution to match display size (device pixel ratio support could be added here if needed)
    canvas.value.width = rect.width;
    canvas.value.height = rect.height;

    // Redraw after resize
    localRedraw();
  }
};

const localRedraw = () => {
  redraw(ctx.value, canvas.value, props.vectors, props.currentVector);
};

const performRedraw = () => {
  rafId = null;
  localRedraw();
};

const scheduleRedraw = () => {
  if (rafId === null) {
    rafId = requestAnimationFrame(performRedraw);
  }
};

// Watch for changes in vectors to redraw
watch(
  () => [props.vectors, props.currentVector],
  () => {
    scheduleRedraw();
  },
  { deep: true },
);

// Expose canvas for parent to potentially grab dataUrl or other needs if necessary
defineExpose({
  canvas,
  container,
  checkCollision: (x: number, y: number): number => {
    return checkCollision(ctx.value, canvas.value, props.vectors, x, y);
  },
});
</script>

<template>
  <div ref="container" class="drawing-container">
    <canvas ref="canvas" class="drawing-canvas"></canvas>
  </div>
</template>

<style scoped>
.drawing-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none !important; /* Force pass-through to fix Windows WebView2 masking */
  z-index: 5;
}

.drawing-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
