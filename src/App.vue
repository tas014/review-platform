<script setup lang="ts">
import Modes from "./components/Modes.vue";
import { ref, provide, Ref, useTemplateRef } from "vue";
import VideoComponent from "./components/video/VideoComponent.vue";
import VideoPlaceholder from "./components/video/VideoPlaceholder.vue";
import AnalysisMenu from "./components/AnalysisMenu.vue";
import { useVideo } from "./components/store/hooks/useVideo";
import { videoUrl } from "./components/store/hooks/useFileUpload";
import useBreakpoint from "./components/store/hooks/useBreakpoint";
/* import { invoke } from "@tauri-apps/api/core"; */

const mode: Ref<"replay" | "analysis"> = ref("replay"); // for switching between analysis and replay modes
const editing: Ref<null | "draw" | "trim" | "text" | "voice"> = ref(null);
const videoElement = useTemplateRef("video-playback");
const playbackControls = useVideo(videoElement);
const breakpointStore = useBreakpoint();
const toggleMode = () => {
  if (mode.value === "analysis") {
    mode.value = "replay";
  } else {
    mode.value = "analysis";
  }
};

const updateVideoElement = () => {
  playbackControls.initializePlayback();
};
provide("mode", {
  mode,
  toggleMode,
});
provide("video", {
  videoElement,
  playbackControls,
});
provide("breakpointStore", breakpointStore);
provide("editing", editing);
</script>

<template>
  <Modes />
  <main class="container">
    <div
      :class="`playback-wrapper ${mode === 'analysis' ? 'analysis' : 'replay'}`"
    >
      <VideoComponent>
        <template v-slot:video>
          <video
            v-if="videoUrl"
            :src="videoUrl"
            class="video"
            ref="video-playback"
            @loadedmetadata="updateVideoElement"
          ></video>
          <VideoPlaceholder v-else />
        </template>
      </VideoComponent>
      <Transition name="slide-fade">
        <AnalysisMenu v-if="mode === 'analysis'" />
      </Transition>
    </div>
  </main>
</template>

<style scoped>
.playback-wrapper {
  padding: 1rem 2.5vw;
  grid-template-columns: 1fr;
  display: grid;
}
.replay {
  width: 100%;
}
.analysis {
  width: 70vw;
}
.video {
  background-color: black;
  width: 100%;
  height: 75vh;
}
</style>
<style>
@keyframes slide-transition {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.slide-fade-enter-active {
  animation: slide-transition var(--mode-switch-anim-duration) ease-in-out
    forwards;
  position: absolute;
}
.slide-fade-leave-active {
  animation: slide-transition var(--mode-switch-anim-duration) ease-in-out
    reverse forwards;
  position: absolute;
}
@media (max-width: 1350px) {
  .container {
    height: fit-content;
  }
}
</style>
