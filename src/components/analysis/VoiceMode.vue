<script setup lang="ts">
import { computed, inject, Ref } from "vue";
import VoiceIcon from "../icons/Voice.vue";

const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice"
>;

const isToggled = computed(() => editing.value === "voice");

const toggleVoiceMode = () => {
  if (isToggled.value) {
    editing.value = null;
  } else {
    editing.value = "voice";
  }
};
</script>
<template>
  <li>
    <span
      class="tool-name"
      @click="toggleVoiceMode"
      :class="{ toggled: isToggled }"
      >Add Voice Note</span
    >
    <VoiceIcon class="voice-icon" />
  </li>
</template>
<style scoped>
.tool-name {
  cursor: pointer;
}
.toggled {
  color: var(--green);
}
.voice-icon {
  width: 2.5rem;
  height: 2.5rem;
}
</style>
