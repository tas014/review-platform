<script setup lang="ts">
import { selectVideo } from "../store/hooks/useFileUpload";
</script>
<template>
  <div class="video-placeholder-container" @click="selectVideo">
    <span class="video-placeholder-message"
      >Select a video file to replay!</span
    >
  </div>
</template>
<style scoped>
.video-placeholder-container {
  position: relative;
  height: 70vh;
  display: grid;
  place-content: center;
  background-color: var(--dark-green);
  cursor: pointer;
  color: var(--title-color);
  transition: all 0.2s ease-in-out;
}
.video-placeholder-container:hover {
  text-decoration: underline;
  border: 2px solid var(--title-color);
}
.video-placeholder-container::before {
  opacity: 0;
  transition: all 0.2s ease-in-out;
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  z-index: 1;
}
.video-placeholder-container:hover::before {
  opacity: 1;
}
.video-placeholder-container:hover .video-placeholder-message {
  animation: pulse 0.5s linear;
  z-index: 2;
}
.video-placeholder-message {
  position: relative;
  font-size: var(--mode-size);
}
@keyframes pulse {
  50% {
    scale: 1.03;
  }
}
</style>
