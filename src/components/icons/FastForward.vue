<script setup lang="ts">
defineProps<{
  isFastForwarding: boolean;
  fastForwardSpeed: number | "loop";
}>();
</script>
<template>
  <div>
    <div
      :class="['fast-forward-container icon', { selected: isFastForwarding }]"
      :style="{
        '--animation-duration': `${0.5 - 0.02 * (fastForwardSpeed === 'loop' ? 1 : fastForwardSpeed)}s`,
      }"
    >
      <svg
        fill="currentColor"
        width="800px"
        height="800px"
        viewBox="2 3 20 18"
        id="fast-forward-2"
        data-name="Flat Color"
        xmlns="http://www.w3.org/2000/svg"
        class="icon flat-color"
      >
        <title>Fast Forward</title>
        <path
          id="primary"
          d="M21.54,11.16l-11-7A1,1,0,0,0,9,5V7.63L3.54,4.16A1,1,0,0,0,2,5V19a1,1,0,0,0,1.54.84L9,16.37V19a1,1,0,0,0,1,1,1,1,0,0,0,.54-.16l11-7a1,1,0,0,0,0-1.68Z"
        ></path>
      </svg>
      <svg
        v-if="isFastForwarding"
        v-for="n in 2"
        :key="n"
        fill="currentColor"
        width="800px"
        height="800px"
        viewBox="2 3 20 18"
        id="fast-forward-2"
        data-name="Flat Color"
        xmlns="http://www.w3.org/2000/svg"
        class="icon flat-color"
      >
        <title>Fast Forward</title>
        <path
          id="primary"
          d="M21.54,11.16l-11-7A1,1,0,0,0,9,5V7.63L3.54,4.16A1,1,0,0,0,2,5V19a1,1,0,0,0,1.54.84L9,16.37V19a1,1,0,0,0,1,1,1,1,0,0,0,.54-.16l11-7a1,1,0,0,0,0-1.68Z"
        ></path>
      </svg>
    </div>
    <span v-if="isFastForwarding" class="fast-forward-speed"
      >{{ fastForwardSpeed === "loop" ? 1 : fastForwardSpeed }}x</span
    >
  </div>
</template>
<style scoped>
.selected,
.fast-forward-speed {
  color: var(--title-color);
  text-align: center;
}
.fast-forward-container {
  display: flex;
  overflow: hidden;
  align-items: center;
}
@keyframes move-right {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
.selected svg {
  animation: move-right var(--animation-duration) linear infinite;
  color: var(--title-color);
  min-width: 100%;
  width: 90%;
  height: 90%;
  flex-shrink: 0;
}
</style>
