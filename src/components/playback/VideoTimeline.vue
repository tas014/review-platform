<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, inject } from "vue";
import Breakpoint, {
  BreakpointHook,
} from "../../assets/interfaces/BreakpointType";
import VideoInjection from "../../assets/interfaces/VideoState";
import TimelineHandle from "./TimelineHandle.vue";
import ModeState from "../../assets/interfaces/ModeState";
import TrimOverlay from "./TrimOverlay.vue";

const props = defineProps<{
  skipToTime: (percent: number) => void;
  progress: number;
  transitionTime: string;
  videoDuration: number;
  pause: () => void;
  trimStartPercent?: number; // Optional to avoid breaking if not passed immediately, but logic depends on it in trim mode
  trimEndPercent?: number;
}>();

const emit = defineEmits<{
  (e: "update:trimStartPercent", value: number): void;
  (e: "update:trimEndPercent", value: number): void;
}>();

const breakpointStore = inject("breakpointStore") as BreakpointHook;
const { mode } = inject("mode") as ModeState;
const VidInjection = inject("video") as VideoInjection;
const { playbackControls } = VidInjection;
const breakpoints = computed(() => breakpointStore.breakpoints.value);
const { totalDuration: duration, currentTime } = playbackControls;
const editing = inject("editing") as any;

const progressBar = ref<HTMLElement | null>(null);
const isHovering = ref(false);
const hoverX = ref(0);

// Proxy store activeBreakpoint to number | null for compatibility
const currentBreakpoint = computed({
  get: () => breakpointStore.activeBreakpoint.value?.timeStamp || null,
  set: (val: number | null) => breakpointStore.setCurrentBreakpoint(val),
});

// Computeds for v-model binding with TrimOverlay
const localTrimStart = computed({
  get: () => props.trimStartPercent ?? 0,
  set: (val) => emit("update:trimStartPercent", val),
});

const localTrimEnd = computed({
  get: () => props.trimEndPercent ?? 100,
  set: (val) => emit("update:trimEndPercent", val),
});

const frameToPercentage = (frame: number) => {
  if (!playbackControls.totalDuration.value) return 0;
  return ((frame / playbackControls.totalDuration.value) * 100).toFixed(2);
};

const jumpToBreakpoint = (breakpoint: Breakpoint) => {
  if (!playbackControls.totalDuration.value) return;
  const percent = breakpoint.timeStamp / playbackControls.totalDuration.value;
  props.skipToTime(percent);
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
  currentBreakpoint.value = null; // Deselect breakpoint
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
  currentBreakpoint.value = null; // Deselect breakpoint
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
    <!-- Handle -->
    <div v-if="editing !== 'trim'">
      <TimelineHandle
        :currentTime="currentTime"
        :duration="duration"
        :isHovering="isHovering"
        :hoverX="hoverX"
        :progressBar="progressBar"
        :skipToTime="props.skipToTime"
        :is-seeking="isSeeking"
        :handle-drag="startDrag"
      />
    </div>

    <!-- TrimOverlay -->
    <TrimOverlay
      v-if="editing === 'trim'"
      v-model:trimStartPercent="localTrimStart"
      v-model:trimEndPercent="localTrimEnd"
    />

    <!-- Breakpoints -->
    <div
      v-if="breakpoints.length > 0 && mode === 'analysis'"
      v-for="breakpoint in breakpoints"
      :key="breakpoint.timeStamp"
      class="breakpoint"
      :style="`--video-position: ${frameToPercentage(breakpoint.timeStamp)}%`"
      @click.stop="jumpToBreakpoint(breakpoint)"
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
  transform: translate(-50%, -50%);
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 1rem;
  background-color: var(--breakpoint-color);
  box-shadow: 0px 0px 3px var(--breakpoint-color);
  transition: background-color 0.3s;
}
.breakpoint:hover {
  background-color: var(--breakpoint-button-text-color);
}
</style>
