<script setup lang="ts">
import { inject, computed } from "vue";
import { BreakpointHook } from "../../assets/interfaces/BreakpointType";
import VideoInjection from "../../assets/interfaces/VideoState";

const breakpointStore = inject("breakpointStore") as BreakpointHook;
const VidInjection = inject("video") as VideoInjection;
const { playbackControls } = VidInjection;

const existingBreakpoint = computed(() =>
  breakpointStore.breakpoints.value.find(
    (b) => b.timeStamp === playbackControls.currentTime.value,
  ),
);

const handleClick = () => {
  if (existingBreakpoint.value) {
    editBreakpoint();
  } else {
    addBreakpoint();
  }
};

const addBreakpoint = () => {
  if (!playbackControls.currentTime.value) return;
  breakpointStore.createBreakpoint(playbackControls.currentTime.value);
  // createBreakpoint now sets activeBreakpoint internally
};

const editBreakpoint = () => {
  if (!playbackControls.currentTime.value) return;
  breakpointStore.setCurrentBreakpoint(playbackControls.currentTime.value);
};
</script>
<template>
  <button
    v-if="!existingBreakpoint"
    class="breakpoint-button"
    @click.stop="handleClick"
  >
    Create Breakpoint
  </button>
</template>
<style scoped>
.breakpoint-button {
  --button-color: var(--breakpoint-color);
  --animation-duration: 0.4s;
  position: relative;
  white-space: nowrap;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 60%);
  background-color: var(--button-color);
  color: white;
  border-radius: 5px;
  padding: 1rem 2rem;
  z-index: 3;
  border: none;
}
.breakpoint-button::after {
  content: "";
  position: absolute;
  top: 2%;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
  border-left: 1rem solid transparent;
  border-right: 1rem solid transparent;
  border-bottom: 1rem solid var(--button-color);
  z-index: 4;
}
.breakpoint-button,
.breakpoint-button::after {
  animation-fill-mode: forwards;
  transition: all var(--animation-duration) linear;
}
@keyframes hover {
  0% {
    background-color: var(--breakpoint-color);
  }
  50% {
    font-size: 1.08em;
  }
  100% {
    background-color: var(--title-color);
    color: var(--dark-green);
  }
}
.breakpoint-button:hover {
  --button-color: var(--title-color);
  animation: hover var(--animation-duration) linear;
  color: var(--dark-green);
  cursor: pointer;
}
</style>
