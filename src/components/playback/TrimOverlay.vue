<script setup lang="ts">
import { ref, onUnmounted } from "vue";

const props = defineProps<{
  trimStartPercent: number;
  trimEndPercent: number;
}>();

const emit = defineEmits<{
  (e: "update:trimStartPercent", value: number): void;
  (e: "update:trimEndPercent", value: number): void;
}>();

const container = ref<HTMLElement | null>(null);
const isDraggingStart = ref(false);
const isDraggingEnd = ref(false);

const handleMouseDownStart = () => {
  isDraggingStart.value = true;
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const handleMouseDownEnd = () => {
  isDraggingEnd.value = true;
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!container.value) return;
  const rect = container.value.getBoundingClientRect();
  let percent = ((e.clientX - rect.left) / rect.width) * 100;

  // Clamp 0-100
  percent = Math.max(0, Math.min(100, percent));

  if (isDraggingStart.value) {
    // Prevent crossing end
    percent = Math.min(percent, props.trimEndPercent - 1);
    emit("update:trimStartPercent", percent);
  } else if (isDraggingEnd.value) {
    // Prevent crossing start
    percent = Math.max(percent, props.trimStartPercent + 1);
    emit("update:trimEndPercent", percent);
  }
};

const handleMouseUp = () => {
  isDraggingStart.value = false;
  isDraggingEnd.value = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
};

onUnmounted(() => {
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
});
</script>

<template>
  <div class="trim-overlay-container" ref="container">
    <!-- Left Overlay (Darkened) -->
    <div
      class="trim-overlay left"
      :style="{ width: `${trimStartPercent}%` }"
    ></div>

    <!-- Start Handle -->
    <div
      class="trim-start-handle"
      :style="{ left: `${trimStartPercent}%` }"
      @mousedown.stop="handleMouseDownStart"
    >
      [
    </div>

    <!-- End Handle -->
    <div
      class="trim-end-handle"
      :style="{ left: `${trimEndPercent}%` }"
      @mousedown.stop="handleMouseDownEnd"
    >
      ]
    </div>

    <!-- Right Overlay (Darkened) -->
    <div
      class="trim-overlay right"
      :style="{ left: `${trimEndPercent}%`, width: `${100 - trimEndPercent}%` }"
    ></div>
  </div>
</template>

<style scoped>
.trim-overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  color: var(--title-color);
  pointer-events: none; /* Allow clicks through empty areas */
}

.trim-overlay {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent dark grid */
  pointer-events: none;
}
.trim-overlay.left {
  left: 0;
}
.trim-overlay.right {
  /* left set by style */
}

.trim-start-handle,
.trim-end-handle {
  position: absolute;
  top: 0;
  width: 1rem;
  height: 100%;
  color: var(--dark-text-color);
  font-size: 2rem;
  font-weight: bold;
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; /* Enable interaction */
  z-index: 20;
  transform: translateX(-50%); /* Center handle on the point */
  user-select: none;
}

.trim-start-handle:hover,
.trim-end-handle:hover {
  color: var(--green);
}
</style>
