<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, inject, Ref } from "vue";
import Breakpoint, {
  BreakpointHook,
} from "../../assets/interfaces/BreakpointType";
import { VideoHook } from "../../assets/interfaces/VideoState";
import TimelineHandle from "./TimelineHandle.vue";

const props = defineProps<{
  skipToTime: (percent: number) => void;
  pause: () => void;
  progress: number;
  transitionTime: string;
}>();

const breakpointStore = inject("breakpointStore") as BreakpointHook;
const videoElement = inject("video") as VideoHook;
const currentBreakpoint = inject("currentBreakpoint") as Ref<number | null>;
const breakpoints = computed(() => breakpointStore.breakpoints.value);

const frameToPercentage = (frame: number) => {
  if (!videoElement.currentTime.value) return 0;
  return ((frame / videoElement.currentTime.value) * 100).toFixed(2);
};

const jumpToBreakpoint = (breakpoint: Breakpoint) => {
  if (!videoElement.currentTime.value) return;
  props.skipToTime(breakpoint.timeStamp / videoElement.currentTime.value);
  currentBreakpoint.value = breakpoint.timeStamp;
  isSeeking.value = false;
};

const timelineContainer = ref<HTMLDivElement | null>(null);
const isSeeking = ref(false);
const transitionTimeValue = computed(() => {
  if (isSeeking.value) return "0s";
  return props.transitionTime;
});
let isDragging = false;
const handleTimeLineClick = (event: MouseEvent) => {
  if (isDragging || !timelineContainer.value) return; // Ignore if click is part of a drag
  isSeeking.value = true;
  const timelineRect = timelineContainer.value.getBoundingClientRect();
  const clickX = event.clientX;

  // Calculate position as a percentage (0 to 1)
  const percent = (clickX - timelineRect.left) / timelineRect.width;
  props.skipToTime(percent);
  isSeeking.value = false;
};

const startDrag = () => {
  isDragging = true;
  isSeeking.value = true;
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
  if (isSeeking.value) isSeeking.value = false;
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
    :style="`--video-progress: ${progress}%; --transition-time: ${transitionTimeValue}`"
    ref="timelineContainer"
    @click="handleTimeLineClick"
  >
    <div>
      <TimelineHandle :is-seeking="isSeeking" :handle-drag="startDrag" />
    </div>
    <div
      v-if="breakpoints.length > 0"
      v-for="breakpoint in breakpoints"
      :key="breakpoint.timeStamp"
      class="breakpoint"
      :style="`--video-position: ${frameToPercentage(breakpoint.timeStamp)}%`"
      @click="jumpToBreakpoint(breakpoint)"
    ></div>
  </div>
</template>
<style scoped>
.playback-progress {
  --video-progress: 0%;
  --transition-time: 0.1s;
  height: 1rem;
  background-color: var(--dark-green);
  border-radius: 1rem;
  position: relative;
  z-index: 1;
  cursor: pointer;
}
.playback-progress::before {
  content: "";
  position: absolute;
  z-index: 2;
  width: var(--video-progress);
  height: 100%;
  border-radius: 1rem;
  background-color: var(--title-color);
  transition: width var(--transition-time) linear;
}
.breakpoint {
  --video-position: 0%;
  position: absolute;
  z-index: 3;
  left: var(--video-position);
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 1rem;
  background-color: var(--breakpoint-color);
  box-shadow: 0px 0px 3px var(--breakpoint-color);
}
</style>
