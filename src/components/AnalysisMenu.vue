<script setup lang="ts">
import TrimMode from "./analysis/TrimMode.vue";
import DrawMode from "./analysis/DrawMode.vue";
import TextMode from "./analysis/TextMode.vue";
import VoiceMode from "./analysis/VoiceMode.vue";
import NoBreakpointTemplate from "./analysis/NoBreakpointTemplate.vue";
import { computed, inject } from "vue";
import Breakpoint, { BreakpointHook } from "../assets/interfaces/BreakpointType";
import VideoState from "../assets/interfaces/VideoState";
import type {SelectedTool} from "../assets/interfaces/ModeState"
import DeleteMode from "./analysis/DeleteMode.vue";
import { exportAnalysisFile } from "../assets/utils/exportAnalysis";
import { videoUrl } from "./store/hooks/useFileUpload";

const breakpointStore = inject("breakpointStore") as BreakpointHook;
const videoStore = inject("video") as VideoState;
const editing = inject("editing") as SelectedTool;
const hasBreakpoints = computed(() => breakpointStore.breakpoints.value.length > 0);
const activeBreakpoint = breakpointStore.activeBreakpoint;
const deleteBreakpoint = () => {
  if (activeBreakpoint.value) {
    breakpointStore.removeBreakpoint(activeBreakpoint.value.timeStamp);
    editing.value = null;
  }
};

const handleExport = async () => {
  await exportAnalysisFile(
    videoUrl.value,
    breakpointStore.breakpoints.value as unknown as Breakpoint[],
    videoStore.playbackControls.videoStart.value,
    videoStore.playbackControls.totalDuration.value
  );
};
</script>
<template>
  <section class="wrapper">
    <NoBreakpointTemplate v-if="!hasBreakpoints || !activeBreakpoint" />
    <div class="analysis-menu">
      <h1 class="analysis-main-title">Analysis Menu</h1>
      <div>
        <h3 class="analysis-section-title">Edit</h3>
        <ul class="edit-list">
          <TrimMode />
        </ul>
      </div>
      <div>
        <h3 class="analysis-section-title">Tools</h3>
        <ul class="tool-list">
          <DrawMode />
          <TextMode />
          <VoiceMode />
          <DeleteMode />
        </ul>
      </div>
    </div>
    <div class="analysis-buttons">
      <button class="delete-breakpoint btn" @click="deleteBreakpoint">Delete <br></br>Breakpoint</button>
      <button class="export-analysis btn" @click="handleExport">Export <br></br>Analysis File</button>
    </div>
  </section>
</template>
<style scoped>
.wrapper {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 0%;
  right: 0%;
  width: 27vw;
  height: 100vh;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.4);
  border-left: solid 2px var(--light-green);
}
.tool-list, .edit-list {
  list-style: none;
  display: grid;
  padding-left: 0px;
}
h1,
h3 {
  color: var(--title-color);
  border-bottom: solid 1px var(--title-color);
}
.analysis-main-title {
  font-size: var(--analysis-title-size);
}
.analysis-section-title {
  font-size: var(--analysis-section-title-size);  
}
.analysis-menu {
  margin-top: 5vh;
  display: grid;
  gap: 3rem;
}
.analysis-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.export-analysis {
  background-color: var(--green);
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
.export-analysis:hover {
  background-color: var(--light-green);
}
.delete-breakpoint {
  background-color: var(--delete-breakpoints-inactive);
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
.delete-breakpoint:hover {
  background-color: var(--danger-color);
}
.btn {
  color: #FFF;
  border: none;
  border-radius: 5px;
  padding: 0.5rem;
}
@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0%);
  }
}
.animated-in {
  animation: slide-in 0.5s ease-in-out forwards;
}
.animated-out {
  animation: slide-in 0.5s ease-in-out reverse forwards;
}
</style>
<style>
.tool-list li, .edit-list li {
  display: flex;
  align-items: center;
  padding: 1.5rem 0.5rem;
  border-bottom: solid 1px whitesmoke;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
.tool-list li:hover, .selected-tool {
  background-color: var(--light-green);
}

.tool-name {
  font-size: var(--mode-size);
}
</style>
