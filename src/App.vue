<script setup lang="ts">
import Modes from "./components/Modes.vue";
import { ref, provide, Ref } from "vue";
import VideoComponent from "./components/VideoComponent.vue";
/* import { invoke } from "@tauri-apps/api/core"; */

const mode: Ref<"replay" | "analysis"> = ref("replay"); // for switching between analysis and replay modes
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

/* async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  greetMsg.value = await invoke("greet", { name: name.value });
} */
</script>

<template>
  <main class="container">
    <Modes />
    <div class="wrapper">
      <VideoComponent />
    </div>
  </main>
</template>

<style scoped>
.wrapper {
  padding: 1rem 2.5vw;
}
</style>
