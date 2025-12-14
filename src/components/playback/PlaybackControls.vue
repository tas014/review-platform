<script setup lang="ts">
import { inject, computed } from "vue";
import VideoState from "../../assets/interfaces/VideoState";
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

const playPausePath = computed(() =>
  isPlaying
    ? "M32.16,16.08,8.94,4.47A2.07,2.07,0,0,0,6,6.32V29.53a2.06,2.06,0,0,0,3,1.85L32.16,19.77a2.07,2.07,0,0,0,0-3.7Z"
    : "M19,4V20a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h2A2,2,0,0,1,19,4ZM9,2H7A2,2,0,0,0,5,4V20a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V4A2,2,0,0,0,9,2Z"
);

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
        <div>
          <svg
            class="playback-control-icon"
            viewBox="0 0 256 256"
            @click="skipToStart"
          >
            <path
              d="M56,32a8.00008,8.00008,0,0,1,8,8v73.73535l119.65723-73.124A16.0002,16.0002,0,0,1,208,54.26465v147.4707a16.004,16.004,0,0,1-24.34375,13.65283L64,142.26416V216a8,8,0,0,1-16,0V40A8.00008,8.00008,0,0,1,56,32Z"
            />
            />
          </svg>
        </div>
        <div>
          <svg
            :class="`playback-control-icon ${
              playbackDirection === false ? 'selected' : ''
            }`"
            viewBox="0 0 36 36"
            version="1.1"
            preserveAspectRatio="xMidYMid meet"
            @click="handleRewind"
          >
            <path
              d="M16.92,31.58,1.6,19.57a2,2,0,0,1,0-3.15l15.32-12A1.93,1.93,0,0,1,19,4.2,1.89,1.89,0,0,1,20,6v6.7L30.66,4.42a1.93,1.93,0,0,1,2.06-.22A2,2,0,0,1,33.83,6V30a2,2,0,0,1-1.11,1.79,1.94,1.94,0,0,1-2.06-.22L20,23.31V30a1.89,1.89,0,0,1-1,1.79,1.94,1.94,0,0,1-2.06-.22Z"
            ></path>
            <rect x="0" y="0" width="36" height="36" fill-opacity="0" />
          </svg>
        </div>
        <div>
          <svg
            class="playback-control-icon"
            :viewBox="isPlaying ? '0 0 24 24' : '0 0 36 36'"
            preserveAspectRatio="xMidYMid meet"
            @click="handlePlayPause"
          >
            <path :d="playPausePath"></path>
          </svg>
        </div>
        <div class="inverted">
          <svg
            :class="`playback-control-icon ${
              playbackDirection === true ? 'selected' : ''
            }`"
            viewBox="0 0 36 36"
            version="1.1"
            preserveAspectRatio="xMidYMid meet"
            @click="handleFastForward"
          >
            <path
              d="M16.92,31.58,1.6,19.57a2,2,0,0,1,0-3.15l15.32-12A1.93,1.93,0,0,1,19,4.2,1.89,1.89,0,0,1,20,6v6.7L30.66,4.42a1.93,1.93,0,0,1,2.06-.22A2,2,0,0,1,33.83,6V30a2,2,0,0,1-1.11,1.79,1.94,1.94,0,0,1-2.06-.22L20,23.31V30a1.89,1.89,0,0,1-1,1.79,1.94,1.94,0,0,1-2.06-.22Z"
            ></path>
            <rect x="0" y="0" width="36" height="36" fill-opacity="0" />
          </svg>
        </div>
        <div>
          <svg
            class="playback-control-icon"
            viewBox="0 0 256 256"
            @click="skipToEnd"
          >
            <path
              d="M208,40V216a8,8,0,0,1-16,0V142.26416l-119.65625,73.124A16.00029,16.00029,0,0,1,48,201.73535V54.26465A16.0002,16.0002,0,0,1,72.34277,40.61133L192,113.73535V40a8,8,0,0,1,16,0Z"
            />
            />
          </svg>
        </div>
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
.playback-control-icon {
  width: 4rem;
  height: 4rem;
  fill: white;
  transition: fill 0.5s;
  animation-duration: 0.5s;
  animation-fill-mode: backwards;
}
.inverted {
  transform: scaleX(-1);
}
@keyframes shake-and-jump {
  25% {
    transform: rotate(10deg);
  }
  50% {
    transform: translateY(-0.4rem);
  }
  75% {
    transform: rotate(-10deg);
  }
}

.playback-control-icon:hover {
  animation-name: shake-and-jump;
  fill: var(--title-color);
  cursor: pointer;
}
</style>
