<script setup lang="ts">
import { computed, inject, Ref } from "vue";
import TextIcon from "../icons/Text.vue";

const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice"
>;

const isToggled = computed(() => editing.value === "text");

const toggleTextMode = () => {
  if (isToggled.value) {
    editing.value = null;
  } else {
    editing.value = "text";
  }
};
</script>
<template>
  <li
    @click="toggleTextMode"
    :class="{ 'selected-tool': isToggled }"
    class="text-mode-container"
  >
    <span class="tool-name">Text Note</span>
    <TextIcon class="text-icon" />
  </li>
</template>
<style scoped>
.tool-name {
  cursor: pointer;
}
.toggled {
  color: var(--green);
}
.text-icon {
  width: 2.5rem;
  height: 2.5rem;
}
.text-mode-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
