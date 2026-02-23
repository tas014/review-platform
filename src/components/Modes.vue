<script setup lang="ts">
import { computed, inject, ref } from "vue";
import ModeState from "../assets/interfaces/ModeState";
import type { BreakpointHook } from "../assets/interfaces/BreakpointType";

import VideoInjection from "../assets/interfaces/VideoState";

const { mode, toggleMode } = inject("mode") as ModeState;
const { setCurrentBreakpoint, activeBreakpoint } = inject(
  "breakpointStore",
) as BreakpointHook;
const { playbackControls } = inject("video") as VideoInjection;

const toggledBreakpointKey = ref<number | null>(null);

const swapSelected = (m: "replay" | "analysis") => {
  if (mode.value !== m) {
    if (m === "replay") {
      toggledBreakpointKey.value = activeBreakpoint.value?.timeStamp ?? null;
      setCurrentBreakpoint(null);
    } else {
      const currentTime = playbackControls.currentTime.value ?? 0;
      const savedTime = toggledBreakpointKey.value;
      if (savedTime !== null && Math.abs(currentTime - savedTime) < 0.1) {
        setCurrentBreakpoint(savedTime);
      }
    }
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
  color: #cdd8c3;
  display: flex;
  justify-content: center;
  font-size: var(--mode-size);
}
.wrapper {
  --modes-border-radius: 10rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 40%;
}
.wrapper h1 {
  font-size: 1em;
}

.mode-container:not(.selected) h1 {
  font-weight: normal;
}

.mode-container {
  display: grid;
  place-content: center;
  padding: 1rem 0rem;
  background-color: var(--dark-green);
  transition: all 0.3s;
}
.mode-container:nth-of-type(1) {
  border-bottom-left-radius: var(--modes-border-radius);
}
.mode-container:nth-of-type(2) {
  border-bottom-right-radius: var(--modes-border-radius);
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
@media (max-width: 1350px) {
  .wrapper {
    --modes-border-radius: 5rem;
    width: 60%;
  }
  header {
    min-height: 5vh;
    height: fit-content;
  }
}
@media (max-width: 700px) {
  .wrapper {
    --modes-border-radius: 2rem;
    width: 80%;
  }
}
</style>
