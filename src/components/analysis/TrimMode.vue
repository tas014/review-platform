<script setup lang="ts">
import Checkbox from "../Checkbox.vue";
import { computed, inject, Ref } from "vue";

const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice"
>;
const isToggled = computed(() => editing.value === "trim");

const toggleTrimMode = () => {
  if (isToggled.value) {
    editing.value = null;
  } else {
    editing.value = "trim";
  }
};
</script>
<template>
  <li @click="toggleTrimMode">
    <span class="tool-name" :class="{ toggled: isToggled }">Trim Mode</span>
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
