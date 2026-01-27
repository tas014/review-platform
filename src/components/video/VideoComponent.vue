<script setup lang="ts">
import { inject, Ref, watch } from "vue";
import ModeState from "../../assets/interfaces/ModeState";
import VideoState from "../../assets/interfaces/VideoState";
import PlaybackControls from "../playback/PlaybackControls.vue";
import { selectVideo, videoName, videoUrl } from "../store/hooks/useFileUpload";
import VideoScreen from "./VideoScreen.vue";

const { mode } = inject("mode") as ModeState;
const { playbackControls } = inject("video") as VideoState;
const { updateVideoSrc } = playbackControls;
const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice"
>;

watch(videoUrl, (newUrl) => {
  updateVideoSrc(newUrl);
});
</script>
<template>
  <div class="main-wrapper">
    <span class="current-file">
      {{ videoName ? "Currently playing:" : "Load a file to start:" }}
      {{ videoName ? videoName : "" }}
      <button class="current-file-button" @click="selectVideo">
        {{ videoName ? "Change file" : "Choose file" }}
      </button>
    </span>
    <div :class="`video-wrapper ${mode}`">
      <VideoScreen>
        <template #video>
          <slot name="video"></slot>
        </template>
      </VideoScreen>
      <div class="controls">
        <PlaybackControls :disabled="editing !== null" />
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
.current-file-button {
  font-size: var(--small-text);
  margin-left: 0.4rem;
  padding: 0rem 1rem;
  background-color: var(--green);
  color: var(--title-color);
  border: solid 1px var(--light-green);
  border-radius: 4px;
  transition: background-color 0.3s;
  cursor: pointer;
}
.current-file-button:hover {
  background-color: var(--checkbox-green);
}
</style>
