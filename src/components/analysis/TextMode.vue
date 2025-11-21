<script setup lang="ts">
const toggleTextMode = () => {
  console.log("Text Mode active");
};
</script>
<template>
  <li>
    <span class="tool-name" @click="toggleTextMode">Add Text Note</span>
    <i class="pi pi-microphone"></i>
  </li>
</template>
