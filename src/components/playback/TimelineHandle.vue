<script setup lang="ts">
import { inject, computed } from "vue";
import BreakpointButton from "../analysis/BreakpointButton.vue";
import VideoInjection from "../../assets/interfaces/VideoState";
import ModeState from "../../assets/interfaces/ModeState";

const props = defineProps<{
  handleDrag: (event: MouseEvent) => void;
  isSeeking: boolean;
}>();

const { mode } = inject("mode") as ModeState;
const { playbackControls } = inject("video") as VideoInjection;
const { videoSrc } = playbackControls;

const showBreakpointButton = computed(() => {
  const renderCondition =
    playbackControls.isPlaying.value ||
    mode.value !== "analysis" ||
    !videoSrc ||
    props.isSeeking ||
    playbackControls.currentTime.value === null;

  return !renderCondition;
});
</script>
<template>
  <div class="progress-wrapper">
    <div
      @mousedown.prevent="handleDrag"
      class="progress-circle"
      :class="{ 'not-allowed': !videoSrc }"
    ></div>
    <BreakpointButton v-if="showBreakpointButton" />
  </div>
</template>
<style scoped>
.progress-wrapper {
  position: relative;
  left: var(--video-progress);
  width: 2rem;
  height: 2rem;
  transform: translate(-50%, -25%);
  transition: left var(--transition-time) linear;
}
.progress-circle {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--light-green);
  box-shadow: 0px 0px 3px var(--light-green);
  cursor: grab;
  transition: background-color 0.3s;
}
.progress-circle:hover {
  background-color: var(--title-color);
}
.progress-circle:active {
  cursor: grabbing;
}
.progress-circle.not-allowed {
  cursor: not-allowed;
}
.progress-circle.not-allowed:hover {
  background-color: var(--light-green);
}
.progress-circle.not-allowed:active {
  cursor: not-allowed;
}
</style>
