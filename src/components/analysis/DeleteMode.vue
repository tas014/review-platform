<script setup lang="ts">
import Checkbox from "../Checkbox.vue";
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
  <li @click="toggleDeleteMode" class="delete-mode-container">
    <span class="tool-name" :class="{ toggled: isToggled }">Delete Mode</span>
    <DeleteIcon class="delete-icon" />
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
