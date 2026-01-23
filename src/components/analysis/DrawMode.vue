<script setup lang="ts">
import Checkbox from "../Checkbox.vue";
import { computed, inject, Ref } from "vue";

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
  <li @click="toggleDrawMode">
    <span class="tool-name" :class="{ toggled: isToggled }">Draw Mode</span>
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
</style>
