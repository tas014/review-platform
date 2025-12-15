<script setup lang="ts">
import { inject, computed, Ref } from "vue";
import { BreakpointHook } from "../../assets/interfaces/BreakpointType";
import { VideoHook } from "../../assets/interfaces/VideoState";

const breakpointStore = inject("breakpointStore") as BreakpointHook;
const videoElement = inject("video") as VideoHook;
const currentBreakpoint = inject("currentBreakpoint") as Ref<number | null>;

const existingBreakpoint = computed(() =>
  breakpointStore.breakpoints.value.find(
    (b) => b.timeStamp === videoElement.currentTime.value
  )
);

const addBreakpoint = () => {
  if (!videoElement.currentTime.value) return;
  breakpointStore.createBreakpoint(videoElement.currentTime.value);
};

const editBreakpoint = () => {
  if (!videoElement.currentTime.value) return;
  currentBreakpoint.value = videoElement.currentTime.value;
};
</script>
<template>
  <button
    class="breakpoint-button"
    @click="existingBreakpoint ? editBreakpoint : addBreakpoint"
  >
    {{ existingBreakpoint ? "Edit Breakpoint" : "Create Breakpoint" }}
  </button>
</template>
<style scoped>
.breakpoint-button {
  position: relative;
  white-space: nowrap;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 85%);
  background-color: var(--breakpoint-color);
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
  border-bottom: 1rem solid var(--breakpoint-color);
  z-index: 4;
}
</style>
