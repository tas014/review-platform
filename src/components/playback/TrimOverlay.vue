<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { startTrimDrag, cleanupTrimDrag } from "../../assets/utils/handleTrim";

const props = defineProps<{
  trimStartPercent: number;
  trimEndPercent: number;
}>();

const emit = defineEmits<{
  (e: "update:trimStartPercent", value: number): void;
  (e: "update:trimEndPercent", value: number): void;
}>();

const container = ref<HTMLElement | null>(null);

const handleMouseDownStart = () => {
  startTrimDrag(
    "start",
    container.value,
    props.trimStartPercent,
    props.trimEndPercent,
    emit,
  );
};

const handleMouseDownEnd = () => {
  startTrimDrag(
    "end",
    container.value,
    props.trimStartPercent,
    props.trimEndPercent,
    emit,
  );
};

onUnmounted(() => {
  cleanupTrimDrag();
});
</script>

<template>
  <Transition name="fade-and-highlight" appear>
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
        @mousedown.stop.prevent="handleMouseDownStart"
      >
        [
      </div>

      <!-- End Handle -->
      <div
        class="trim-end-handle"
        :style="{ left: `${trimEndPercent}%` }"
        @mousedown.stop.prevent="handleMouseDownEnd"
      >
        ]
      </div>

      <!-- Right Overlay (Darkened) -->
      <div
        class="trim-overlay right"
        :style="{
          left: `${trimEndPercent}%`,
          width: `${100 - trimEndPercent}%`,
        }"
      ></div>
    </div>
  </Transition>
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
  pointer-events: none;
}

.trim-overlay {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
.trim-overlay.left {
  left: 0;
}
.trim-start-handle,
.trim-end-handle {
  position: absolute;
  top: 0;
  width: 1rem;
  height: 100%;
  color: var(--breakpoint-color);
  font-size: 2.5rem;
  font-weight: bold;
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 20;
  transform: translateX(-50%) translateY(-10%);
  user-select: none;
  transition: color 0.2s linear;
}

.trim-start-handle:hover,
.trim-end-handle:hover {
  color: var(--green);
}

.fade-and-highlight-enter-active,
.fade-and-highlight-leave-active {
  transition: opacity 0.5s linear;
}

.fade-and-highlight-enter-from,
.fade-and-highlight-leave-to {
  opacity: 0;
}

/* Target handles specifically for the entering zoom/highlight effect */
.fade-and-highlight-enter-active .trim-start-handle,
.fade-and-highlight-enter-active .trim-end-handle {
  transition:
    transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    color 2s ease;
}

.fade-and-highlight-enter-from .trim-start-handle,
.fade-and-highlight-enter-from .trim-end-handle {
  transform: translateX(-50%) translateY(-10%) scale(2.5);
  color: white;
}
</style>
