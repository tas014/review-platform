<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import type { Vector } from "../../../assets/interfaces/BreakpointType";
import { redraw } from "../../../assets/utils/handleDraw";

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
    if (!ctx.value || !canvas.value) return -1;
    const width = canvas.value.width;
    const height = canvas.value.height;

    // Check in reverse order (topmost first)
    for (let i = props.vectors.length - 1; i >= 0; i--) {
      const vector = props.vectors[i];
      const path = new Path2D();

      if (vector.line.length > 0) {
        path.moveTo(vector.line[0].x * width, vector.line[0].y * height);
        for (let j = 1; j < vector.line.length; j++) {
          path.lineTo(vector.line[j].x * width, vector.line[j].y * height);
        }
      }

      // Use a wider line width for easier selection
      const originalLineWidth = ctx.value.lineWidth;
      ctx.value.lineWidth = Math.max(10, vector.lineWidth * 2);
      const isHit = ctx.value.isPointInStroke(path, x, y);
      ctx.value.lineWidth = originalLineWidth; // Restore (though we redraw anyway)

      if (isHit) {
        return i;
      }
    }
    return -1;
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
  pointer-events: none; /* Pass events through by default, parent handles interaction if needed or we add handlers here */
}

.drawing-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
