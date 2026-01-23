<script setup lang="ts">
defineProps<{ isPlaying: boolean }>();
</script>
<template>
  <svg
    v-if="isPlaying"
    class="icon flat-color"
    fill="currentColor"
    width="800px"
    height="800px"
    viewBox="0 0 36 36"
    version="1.1"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <title>Play</title>
    <path
      class="clr-i-solid clr-i-solid-path-1"
      d="M32.16,16.08,8.94,4.47A2.07,2.07,0,0,0,6,6.32V29.53a2.06,2.06,0,0,0,3,1.85L32.16,19.77a2.07,2.07,0,0,0,0-3.7Z"
    ></path>
    <rect x="0" y="0" width="36" height="36" fill-opacity="0" />
  </svg>
  <svg
    v-else
    fill="currentColor"
    width="800px"
    height="800px"
    viewBox="0 0 24 24"
    id="pause"
    data-name="Flat Color"
    xmlns="http://www.w3.org/2000/svg"
    class="icon flat-color"
  >
    <title>Pause</title>
    <path
      id="primary"
      d="M19,4V20a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h2A2,2,0,0,1,19,4ZM9,2H7A2,2,0,0,0,5,4V20a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V4A2,2,0,0,0,9,2Z"
    ></path>
  </svg>
</template>
