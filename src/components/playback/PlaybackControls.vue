<script setup lang="ts">
import { inject } from "vue";
import VideoState from "../../assets/interfaces/VideoState";
import VideoTimeline from "./VideoTimeline.vue";
import { CurrentBreakpointInjection } from "../../assets/interfaces/BreakpointType";
import SkipToStart from "../icons/SkipToStart.vue";
import SkipToEnd from "../icons/SkipToEnd.vue";
import PlayPause from "../icons/PlayPause.vue";
import FastForward from "../icons/FastForward.vue";
import Rewind from "../icons/Rewind.vue";

defineProps<{ disabled: boolean }>();

const { playbackControls } = inject("video") as VideoState;
const currentBreakpoint = inject(
  "currentBreakpoint",
) as CurrentBreakpointInjection;
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
  currentBreakpoint.value = null;
};

const handleRewind = () => {
  if (playbackDirection.value === false) return rewind("loop");
  if (playbackDirection.value !== null) return rewind();
  currentBreakpoint.value = null;
};

const handlePlayPause = () => {
  if (playbackDirection.value === null) {
    currentBreakpoint.value = null;
    return play();
  }
  pause();
};
</script>
<template>
  <div class="wrapper">
    <Transition name="fade">
      <div class="disable-controls" v-if="disabled"></div>
    </Transition>
    <VideoTimeline
      :skip-to-time="skipToTime"
      :pause="pause"
      :progress="progress"
      :transition-time="transitionTime"
    />
    <div class="playback-controls">
      <div class="controls-container">
        <SkipToStart @click="skipToStart" />
        <Rewind
          :isRewinding="playbackDirection === false"
          @click="handleRewind"
        />
        <PlayPause :isPlaying="isPlaying !== null" @click="handlePlayPause" />
        <FastForward
          :isFastForwarding="playbackDirection === true"
          @click="handleFastForward"
        />
        <SkipToEnd @click="skipToEnd"></SkipToEnd>
      </div>
    </div>
  </div>
</template>
<style scoped>
.wrapper {
  position: relative;
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
  color: var(--title-color);
  gap: 8rem;
}
.controls-container i {
  font-size: 3.8rem;
  font-weight: bold;
  cursor: pointer;
}
.disable-controls {
  position: absolute;
  box-sizing: content-box;
  width: 100%;
  height: 100%;
  z-index: 10;
  border-radius: 10px;
  padding: 1.5rem 0rem;
  transform: translateY(-0.75rem);
  background-color: rgba(0, 0, 0, 0.7);
  cursor: not-allowed;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
<style>
.icon {
  color: white;
  height: 3.8rem;
  width: 3.8rem;
  cursor: pointer;
  transition: color 0.3s;
}
.icon:hover {
  color: var(--title-color);
}
</style>
