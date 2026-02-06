<script setup lang="ts">
import Checkbox from "../Checkbox.vue";
import { computed, inject, Ref } from "vue";

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
  <li @click="toggleDeleteMode">
    <span class="tool-name" :class="{ toggled: isToggled }">Delete Mode</span>
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
