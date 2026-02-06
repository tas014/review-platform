<script setup lang="ts">
import { inject, type Ref, computed, ref } from "vue";
import VideoState from "../../assets/interfaces/VideoState";
import VideoTimeline from "./VideoTimeline.vue";
import { BreakpointHook } from "../../assets/interfaces/BreakpointType";
import SkipToStart from "../icons/SkipToStart.vue";
import SkipToEnd from "../icons/SkipToEnd.vue";
import PlayPause from "../icons/PlayPause.vue";
import FastForward from "../icons/FastForward.vue";
import Rewind from "../icons/Rewind.vue";

const { playbackControls } = inject("video") as VideoState;
const breakpointStore = inject("breakpointStore") as BreakpointHook;
const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice"
>;

const disabled = computed(() => {
  return editing.value !== null && editing.value !== "trim";
});

const {
  isPlaying,
  progress,
  playbackDirection,
  transitionTime,
  playbackSpeed,
  totalDuration,
  play,
  rewind,
  fastForward,
  pause,
  skipToStart,
  skipToEnd,
  skipToTime,
  setTrim, // Inject setTrim
  videoStart,
} = playbackControls;

// Trim State
const trimStart = ref(0);
const trimEnd = ref(100);

const handleFastForward = () => {
  if (playbackDirection.value === true) return fastForward("loop");
  if (playbackDirection.value !== null) return fastForward();
  breakpointStore.setCurrentBreakpoint(null);
};

const handleRewind = () => {
  if (playbackDirection.value === false) return rewind("loop");
  if (playbackDirection.value !== null) return rewind();
  breakpointStore.setCurrentBreakpoint(null);
};

const handlePlayPause = () => {
  console.log(isPlaying.value);
  if (playbackDirection.value === null) {
    breakpointStore.setCurrentBreakpoint(null);
    return play();
  }
  pause();
};

const cancelTrim = () => {
  trimStart.value = 0;
  trimEnd.value = 100;
  editing.value = null;
};

const confirmTrim = () => {
  if (!totalDuration.value) return;
  const startSeconds = (trimStart.value / 100) * totalDuration.value;
  const endSeconds = (trimEnd.value / 100) * totalDuration.value;

  // Calculate new absolute start/end BEFORE calling setTrim (which modifies videoStart)
  const currentAbsoluteStart = videoStart.value || 0;
  const newAbsoluteStart = currentAbsoluteStart + startSeconds;
  const newAbsoluteEnd = currentAbsoluteStart + endSeconds;

  setTrim(startSeconds, endSeconds);

  breakpointStore.cleanupBreakpoints(newAbsoluteStart, newAbsoluteEnd);

  // Reset after confirming
  trimStart.value = 0;
  trimEnd.value = 100;
  editing.value = null;
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
      :video-duration="totalDuration ? totalDuration : 0"
      v-model:trimStartPercent="trimStart"
      v-model:trimEndPercent="trimEnd"
    />
    <div class="playback-controls" v-if="editing !== 'trim'">
      <div class="controls-container">
        <SkipToStart @click="skipToStart" />
        <Rewind
          :isRewinding="playbackDirection === false"
          :rewindSpeed="playbackSpeed"
          @click="handleRewind"
        />
        <PlayPause :isPlaying="isPlaying" @click="handlePlayPause" />
        <FastForward
          :isFastForwarding="playbackDirection === true && playbackSpeed !== 1"
          :fastForwardSpeed="playbackSpeed"
          @click="handleFastForward"
        />
        <SkipToEnd @click="skipToEnd"></SkipToEnd>
      </div>
    </div>
    <div class="trim-actions" v-else>
      <button class="trim-cancel" @click="cancelTrim">Cancel</button>
      <button class="trim-confirm" @click="confirmTrim">Confirm</button>
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
.trim-actions {
  display: flex;
  gap: 2rem;
  justify-content: center;
}
.trim-cancel,
.trim-confirm {
  padding: 1rem 2rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 1.6rem;
  font-weight: 600;
  transition: all 0.3s ease;
}
.trim-cancel {
  background-color: var(--danger-color);
  color: white;
}
.trim-confirm {
  background-color: var(--success-color);
  color: white;
}
.trim-actions button:hover {
  transform: scale(1.1);
}
.trim-cancel:hover {
  background-color: var(--danger-hover-color);
}
.trim-confirm:hover {
  background-color: var(--success-hover-color);
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
@keyframes scale {
  50% {
    transform: scale(1.1);
  }
}
.icon {
  color: white;
  height: 3.8rem;
  width: 3.8rem;
  cursor: pointer;
  transition: color 0.3s;
}
.icon:hover {
  color: var(--title-color);
  animation: scale 0.3s ease-in-out;
}
</style>
