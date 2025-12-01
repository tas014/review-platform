<script setup lang="ts">
import { inject, computed } from "vue";
import { VideoHook } from "../../assets/interfaces/VideoState";
import BreakpointButton from "../analysis/BreakpointButton.vue";

const videoElement = inject("video") as VideoHook;

const isPlaying = computed(() => videoElement.isPlaying.value);
</script>
<template>
  <div class="wrapper">
    <div class="progress-circle"></div>
    <BreakpointButton v-if="!isPlaying" />
  </div>
</template>
<style scoped>
.progress-circle {
  position: absolute;
  z-index: 4;
  left: var(--video-progress);
  top: 50%;
  transform: translateY(-50%) translateX(-50%);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--light-green);
  box-shadow: 0px 0px 3px var(--light-green);
  cursor: grab;
  transition: background-color 0.3s, left var(--transition-time) linear;
}
.progress-circle:hover {
  background-color: var(--title-color);
}
.progress-circle:active {
  cursor: grabbing;
}
</style>
