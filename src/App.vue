<script setup lang="ts">
import Modes from "./components/Modes.vue";
import { ref, provide, Ref, useTemplateRef, reactive } from "vue";
import VideoComponent from "./components/VideoComponent.vue";
import AnalysisMenu from "./components/AnalysisMenu.vue";
import { useVideo } from "./components/store/hooks/useVideo";
/* import { invoke } from "@tauri-apps/api/core"; */

const mode: Ref<"replay" | "analysis"> = ref("replay"); // for switching between analysis and replay modes
const videoElement = useTemplateRef("video-playback");
const playbackControls = useVideo(videoElement);
const toggleMode = () => {
  if (mode.value === "analysis") {
    mode.value = "replay";
  } else {
    mode.value = "analysis";
  }
};
provide("mode", {
  mode,
  toggleMode,
});
provide("video", {
  videoElement,
  playbackControls,
});

/* async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  greetMsg.value = await invoke("greet", { name: name.value });
} */
</script>

<template>
  <main class="container">
    <Modes />
    <div
      :class="`playback-wrapper ${mode === 'analysis' ? 'analysis' : 'replay'}`"
    >
      <VideoComponent>
        <template v-slot:video>
          <video class="video" ref="video-playback"></video>
        </template>
      </VideoComponent>
      <AnalysisMenu v-if="mode === 'analysis'" />
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
