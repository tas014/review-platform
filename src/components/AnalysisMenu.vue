<script setup lang="ts">
import TrimMode from "./analysis/TrimMode.vue";
import DrawMode from "./analysis/DrawMode.vue";
import TextMode from "./analysis/TextMode.vue";
import VoiceMode from "./analysis/VoiceMode.vue";
import NoBreakpointTemplate from "./analysis/NoBreakpointTemplate.vue";
import { computed, inject } from "vue";
import { BreakpointHook } from "../assets/interfaces/BreakpointType";

const breakpointStore = inject("breakpointStore") as BreakpointHook;
const hasBreakpoints = computed(() => breakpointStore.breakpoints.value.length > 0);

</script>
<template>
  <section class="wrapper">
    <NoBreakpointTemplate v-if="!hasBreakpoints" />
    <div class="analysis-menu">
      <h1 class="analysis-main-title">Analysis Menu</h1>
      <div>
        <h3 class="analysis-section-title">Edit</h3>
        <ul class="tool-list">
          <TrimMode />
        </ul>
      </div>
      <div>
        <h3 class="analysis-section-title">Tools</h3>
        <ul class="tool-list">
          <DrawMode />
          <TextMode />
          <VoiceMode />
        </ul>
      </div>
    </div>
    <div class="analysis-buttons">
      <button class="delete-breakpoints btn">Delete All <br></br>Breakpoints</button>
      <button class="export-analysis btn">Export <br></br>Analysis File</button>
    </div>
  </section>
</template>
<style scoped>
.wrapper {
  position: relative;
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
.tool-list {
  list-style: none;
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
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
}
.delete-breakpoints {
  background-color: var(--delete-breakpoints-inactive);
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
.tool-list li {
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: solid 1px whitesmoke;
}
.tool-list span {
  margin-right: 1rem;
}
.tool-name {
  font-size: var(--mode-size);
}
</style>
