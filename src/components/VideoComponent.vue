<script setup lang="ts">
import { inject } from "vue";
import ModeState from "../assets/interfaces/ModeState";

const { mode } = inject<ModeState>("mode") as ModeState;
</script>
<template>
  <div :class="`wrapper ${mode}`">
    <!-- Handle video here -->
  </div>
</template>
<style scoped>
.wrapper {
  background-color: var(--green);
  height: 70vh;
  border-radius: 10px;
  transition: width 0.3s;
}
.replay {
  width: 95vw;
  border: solid 3px var(--light-green);
}
.analysis {
  width: 70vw;
}
</style>
