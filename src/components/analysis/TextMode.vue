<script setup lang="ts">
import { computed, inject, Ref } from "vue";

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
  <li>
    <span
      class="tool-name"
      @click="toggleTextMode"
      :class="{ toggled: isToggled }"
      >Add Text Note</span
    >
    <i class="pi pi-microphone"></i>
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
