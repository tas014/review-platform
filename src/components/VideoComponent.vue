<script setup lang="ts">
import { inject } from "vue";
import ModeState from "../assets/interfaces/ModeState";
import VideoState from "../assets/interfaces/VideoState";
import PlaybackControls from "./PlaybackControls.vue";
import { selectVideo, videoName } from "./store/hooks/useFileUpload";

const { mode } = inject("mode") as ModeState;
const { playbackControls } = inject("video") as VideoState;

const { isPlaying } = playbackControls;
</script>
<template>
  <div class="main-wrapper">
    <span class="current-file">
      {{ videoName ? "Currently playing:" : "Load a file to start:" }}
      {{ videoName ? videoName : "" }}
      <button @click="selectVideo">
        {{ videoName ? "Change file" : "Choose file" }}
      </button>
    </span>
    <div :class="`video-wrapper ${mode}`">
      <div :class="`video-container ${isPlaying ? 'playing' : ''}`">
        <slot name="video"></slot>
      </div>
      <div class="controls">
        <PlaybackControls />
      </div>
      <!-- Handle video here -->
    </div>
  </div>
</template>
<style scoped>
.video-wrapper {
  display: flex;
  margin-top: 1rem;
  flex-direction: column;
  gap: 1rem;
  transition: width var(--mode-switch-anim-duration);
}
.replay {
  width: 95vw;
}
.analysis {
  width: 70vw;
}
.current-file {
  color: var(--title-color);
}
.current-file button {
  font-size: var(--small-text);
  margin-left: 0.4rem;
  padding: 0rem 1rem;
  background-color: var(--green);
  color: var(--title-color);
  border: solid 1px var(--light-green);
  border-radius: 4px;
}
.video-container {
  height: 70vh;
  border-radius: 10px;
  overflow: hidden;
}
.playing {
  box-sizing: border-box;
  border: solid 3px var(--light-green);
}
</style>
