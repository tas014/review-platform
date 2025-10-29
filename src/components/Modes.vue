<script setup lang="ts">
import { computed, inject } from "vue";
import ModeState from "../assets/interfaces/ModeState";

const { mode, toggleMode } = inject("mode") as ModeState;

const swapSelected = (m: "replay" | "analysis") => {
  if (mode.value !== m) {
    toggleMode();
  }
};
const selected = computed(() => {
  return mode.value === "replay";
});
</script>
<template>
  <header>
    <div class="wrapper">
      <div
        :class="selected ? 'mode-container selected' : 'mode-container'"
        @click="() => swapSelected('replay')"
      >
        <h1>Replay Mode</h1>
      </div>
      <div
        :class="!selected ? 'mode-container selected' : 'mode-container'"
        @click="() => swapSelected('analysis')"
      >
        <h1>Analysis Mode</h1>
      </div>
    </div>
  </header>
</template>
<style scoped>
header {
  height: 5vh;
  color: #cdd8c3;
  display: flex;
  justify-content: center;
  font-size: var(--mode-size);
}
.wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 30%;
}
.wrapper h1:not(.selected) {
  font-size: 1em;
}
.mode-container {
  display: grid;
  place-content: center;
  padding: 1rem 0rem;
  background-color: var(--dark-green);
  transition: all 0.3s;
}
.mode-container:nth-of-type(1) {
  border-bottom-left-radius: 10rem;
}
.mode-container:nth-of-type(2) {
  border-bottom-right-radius: 10rem;
}
.mode-container:not(.selected):hover {
  color: #fff;
  background-color: var(--light-green);
  box-shadow: 0px 0px 5px var(--title-color);
  cursor: pointer;
}
.selected {
  font-size: 1.1em;
  background-color: var(--title-color);
  color: #2d873d;
  font-weight: bold;
  box-shadow: 0px 0px 5px var(--title-color);
}
</style>
