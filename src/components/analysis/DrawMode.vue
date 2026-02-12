<script setup lang="ts">
import Checkbox from "../Checkbox.vue";
import { computed, inject, Ref } from "vue";
import DrawIcon from "../icons/Draw.vue";

const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice"
>;

const isToggled = computed(() => editing.value === "draw");

const toggleDrawMode = () => {
  if (isToggled.value) {
    editing.value = null;
  } else {
    editing.value = "draw";
  }
};
</script>
<template>
  <li @click="toggleDrawMode" class="draw-mode-container">
    <span class="tool-name" :class="{ toggled: isToggled }">Draw Mode</span>
    <DrawIcon class="draw-icon" />
    <Checkbox :isActive="isToggled" />
  </li>
</template>
<style scoped>
.tool-name {
  cursor: pointer;
}
.toggled {
  color: var(--green);
}
.draw-mode-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.draw-icon {
  width: 2.5rem;
  height: 2.5rem;
}
</style>
