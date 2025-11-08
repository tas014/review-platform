<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{
  skipToTime: (percent: number) => void;
  pause: () => void;
  progress: number;
}>();

const timelineContainer = ref<HTMLDivElement | null>(null);
let isDragging = false;
const handleTimeLineClick = (event: MouseEvent) => {
  if (isDragging || !timelineContainer.value) return; // Ignore if click is part of a drag

  const timelineRect = timelineContainer.value.getBoundingClientRect();
  const clickX = event.clientX;

  // Calculate position as a percentage (0 to 1)
  const percent = (clickX - timelineRect.left) / timelineRect.width;
  props.skipToTime(percent);
};

const startDrag = () => {
  isDragging = true;
  props.pause(); // Pause video while dragging
};

const handleDrag = (event: MouseEvent) => {
  if (!isDragging || !timelineContainer.value) return;

  const timelineRect = timelineContainer.value.getBoundingClientRect();
  let percent = (event.clientX - timelineRect.left) / timelineRect.width;

  // Clamp the percentage between 0 and 1
  percent = Math.min(1, Math.max(0, percent));
  props.skipToTime(percent);
};

const stopDrag = () => {
  if (isDragging) isDragging = false;
};

onMounted(() => {
  // Add global event listeners for dragging
  document.addEventListener("mousemove", handleDrag);
  document.addEventListener("mouseup", stopDrag);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", stopDrag);
});
</script>
<template>
  <div
    class="playback-progress"
    ref="timelineContainer"
    @click="handleTimeLineClick"
  >
    <div
      class="progress-circle"
      :style="`--progress-percent: ${progress}%`"
      @mousedown.prevent="startDrag"
    ></div>
  </div>
</template>
<style scoped>
.playback-progress {
  height: 1vh;
  background-color: var(--dark-green);
  border-radius: 1rem;
  position: relative;
}
.progress-circle {
  --progress-percent: 0%;
  --transition-time: 0.5s;
  position: absolute;
  left: var(--progress-percent);
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--light-green);
  box-shadow: 0px 0px 3px var(--light-green);
  cursor: pointer;
  transition: background-color 0.3s, left var(--transition-time) linear;
}
.progress-circle:hover {
  background-color: var(--title-color);
}
</style>
