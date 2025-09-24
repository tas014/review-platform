<script setup lang="ts">
import { inject } from "vue";
import VideoState from "../assets/interfaces/VideoState";

const { playbackControls } = inject("video") as VideoState;
const {
  isPlaying,
  src,
  currentFrame,
  playbackDirection,
  play,
  rewind,
  fastForward,
  pause,
} = playbackControls;

const handleFastForward = () => {
  if (isPlaying.value === true) return fastForward("loop");
  if (isPlaying.value !== null) {
    fastForward();
  } else if (src !== null) {
    fastForward();
  }
};

const handleRewind = () => {
  if (isPlaying.value === false) return rewind("loop");
  if (isPlaying.value !== null) {
    rewind();
  } else if (src !== null) {
    rewind();
  }
};

const handlePlayPause = () => {
  if (src === null) return;
  if (isPlaying.value === null) {
    play();
  } else {
    pause();
  }
};
</script>
<template>
  <div class="wrapper">
    <div class="playback-progress">
      <div class="progress-circle"></div>
    </div>
    <div class="playback-controls">
      <div class="controls-container">
        <i
          :class="`pi pi-step-backward-alt`"
          @click="
            () => {
              currentFrame = 0;
            }
          "
        ></i>
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
        <i :class="`pi pi-step-forward-alt`"></i>
      </div>
    </div>
  </div>
</template>
<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 0rem 2rem 2rem 2rem;
}
.playback-progress {
  height: 1vh;
  background-color: var(--dark-green);
  border-radius: 1rem;
  position: relative;
}
.progress-circle {
  position: absolute;
  left: 15%;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--light-green);
  box-shadow: 0px 0px 3px var(--light-green);
  cursor: pointer;
  transition: background-color 0.3s;
}
.progress-circle:hover {
  background-color: var(--title-color);
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
  font-size: 3rem;
  font-weight: bold;
  cursor: pointer;
}
</style>
