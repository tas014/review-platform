<script setup lang="ts">
import { inject } from "vue";
import VideoState from "../assets/interfaces/VideoState";
import VideoTimeline from "./VideoTimeline.vue";

const { playbackControls } = inject("video") as VideoState;
const {
  isPlaying,
  progress,
  playbackDirection,
  transitionTime,
  play,
  rewind,
  fastForward,
  pause,
  skipToStart,
  skipToEnd,
  skipToTime,
} = playbackControls;

const handleFastForward = () => {
  if (playbackDirection.value === true) return fastForward("loop");
  if (playbackDirection.value !== null) return fastForward();
};

const handleRewind = () => {
  if (playbackDirection.value === false) return rewind("loop");
  if (playbackDirection.value !== null) return rewind();
};

const handlePlayPause = () => {
  if (playbackDirection.value === null) return play();
  pause();
};
</script>
<template>
  <div class="wrapper">
    <VideoTimeline
      :skip-to-time="skipToTime"
      :pause="pause"
      :progress="progress"
      :transition-time="transitionTime"
    />
    <div class="playback-controls">
      <div class="controls-container">
        <i :class="`pi pi-step-backward-alt`" @click="skipToStart"></i>
        <i
          :class="`pi pi-backward ${
            playbackDirection === false ? 'selected' : ''
          }`"
          @click="handleRewind"
        ></i>
        <i
          :class="`pi ${isPlaying ? 'pi-pause' : 'pi-play'}`"
          @click="handlePlayPause"
        ></i>
        <i
          :class="`pi pi-forward ${
            playbackDirection === true ? 'selected' : ''
          }`"
          @click="handleFastForward"
        ></i>
        <i :class="`pi pi-step-forward-alt`" @click="skipToEnd"></i>
      </div>
    </div>
  </div>
</template>
<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
.playback-controls {
  display: grid;
  place-content: center;
}
.controls-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rem;
}
.controls-container i {
  font-size: 3.8rem;
  font-weight: bold;
  cursor: pointer;
}
</style>
