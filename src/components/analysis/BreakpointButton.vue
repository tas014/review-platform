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
  <button @click="existingBreakpoint ? editBreakpoint : addBreakpoint">
    {{ existingBreakpoint ? "Edit Breakpoint" : "Create Breakpoint" }}
  </button>
</template>
<style scoped>
button {
  background-color: var(--breakpoint-color);
  color: white;
  border-radius: 5px;
  padding: 0.5rem;
}
</style>
