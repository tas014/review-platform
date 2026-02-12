<script setup lang="ts">
import { computed, inject, Ref } from "vue";
import DeleteIcon from "../icons/Delete.vue";

const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice" | "delete"
>;

const isToggled = computed(() => editing.value === "delete");

const toggleDeleteMode = () => {
  if (isToggled.value) {
    editing.value = null;
  } else {
    editing.value = "delete";
  }
};
</script>
<template>
  <li
    @click="toggleDeleteMode"
    :class="{ 'selected-tool': isToggled }"
    class="delete-mode-container"
  >
    <span class="tool-name">Delete</span>
    <DeleteIcon class="delete-icon" />
  </li>
</template>
<style scoped>
.toggled {
  color: var(--green);
}
.delete-mode-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.delete-icon {
  width: 2.5rem;
  height: 2.5rem;
}
</style>
