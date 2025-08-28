<script setup lang="ts">
import Modes from "./components/Modes.vue";
import { ref, provide } from "vue";
/* import { invoke } from "@tauri-apps/api/core"; */

const mode = ref(true); // for switching between analysis and review modes
const toggleMode = () => {
  mode.value = !mode.value;
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
    <h1 v-if="mode">Replay Mode</h1>
    <h1 v-else>Analysis Mode</h1>
  </main>
</template>

<style scoped></style>
