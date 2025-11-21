<script setup lang="ts">
const toggleVoiceMode = () => {
  console.log("Voice Mode active");
};
</script>
<template>
  <li>
    <span class="tool-name" @click="toggleVoiceMode">Add Voice Note</span>
    <i class="pi pi-microphone"></i>
  </li>
</template>
