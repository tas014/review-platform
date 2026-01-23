<script setup lang="ts">
defineProps<{ isFastForwarding: boolean }>();
</script>
<template>
  <svg
    :class="`icon flat-color ${isFastForwarding ? 'selected' : ''}`"
    fill="currentColor"
    width="800px"
    height="800px"
    viewBox="0 0 24 24"
    id="fast-forward-2"
    data-name="Flat Color"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Fast Forward</title>
    <path
      id="primary"
      d="M21.54,11.16l-11-7A1,1,0,0,0,9,5V7.63L3.54,4.16A1,1,0,0,0,2,5V19a1,1,0,0,0,1.54.84L9,16.37V19a1,1,0,0,0,1,1,1,1,0,0,0,.54-.16l11-7a1,1,0,0,0,0-1.68Z"
    ></path>
  </svg>
</template>
<style scoped>
.selected {
  color: var(--green);
}
</style>
