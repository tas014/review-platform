<script setup lang="ts">
import { inject, ref } from "vue";
import ModeState from "../assets/interfaces/ModeState";
import VideoState from "../assets/interfaces/VideoState";
import PlaybackControls from "./PlaybackControls.vue";

const { mode } = inject("mode") as ModeState;
const { playbackControls } = inject("video") as VideoState;

const videoData = ref(null);
</script>
<template>
  <div :class="`video-wrapper ${mode}`">
    <div class="video-container">
      <slot name="video"></slot>
    </div>
    <div class="controls">
      <PlaybackControls />
    </div>
    <!-- Handle video here -->
  </div>
</template>
<style scoped>
.video-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: var(--green);
  min-height: 70vh;
  border-radius: 10px;
  transition: width 0.3s;
}
.replay {
  width: 95vw;
  border: solid 3px var(--light-green);
}
.analysis {
  width: 70vw;
}
</style>
