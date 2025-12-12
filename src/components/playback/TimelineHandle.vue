<script setup lang="ts">
import { inject, computed } from "vue";
import { ProvidedContext } from "../../assets/interfaces/VideoState";
import BreakpointButton from "../analysis/BreakpointButton.vue";

const { playbackControls } = inject("video") as ProvidedContext;

const isPlaying = computed(() => playbackControls.isPlaying.value);
</script>
<template>
  <div class="progress-wrapper">
    <div class="progress-circle"></div>
    <BreakpointButton v-if="!isPlaying" />
  </div>
</template>
<style scoped>
.progress-wrapper {
  position: relative;
  width: 2rem;
  height: 2rem;
}
.progress-circle {
  position: absolute;
  z-index: 5;
  left: var(--video-progress);
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 100%;
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
