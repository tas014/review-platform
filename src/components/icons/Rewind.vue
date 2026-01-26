<script setup lang="ts">
defineProps<{
  isRewinding: boolean;
  rewindSpeed: number | "loop";
}>();
</script>
<template>
  <div>
    <div
      :class="['rewind-container icon ', { selected: isRewinding }]"
      :style="{
        '--animation-duration': `${0.5 - 0.02 * (rewindSpeed === 'loop' ? 1 : rewindSpeed)}s`,
      }"
    >
      <svg
        fill="currentColor"
        width="800px"
        height="800px"
        viewBox="2 3 20 18"
        id="fast-backward-2"
        data-name="Flat Color"
        xmlns="http://www.w3.org/2000/svg"
        class="icon flat-color"
      >
        <title>Rewind</title>
        <path
          id="primary"
          d="M21.48,4.12a1,1,0,0,0-1,0L15,7.63V5a1,1,0,0,0-1.54-.84l-11,7a1,1,0,0,0,0,1.68l11,7A1,1,0,0,0,14,20a1,1,0,0,0,1-1V16.37l5.46,3.47A1,1,0,0,0,22,19V5A1,1,0,0,0,21.48,4.12Z"
        ></path>
      </svg>
      <svg
        v-if="isRewinding"
        v-for="n in 2"
        :key="n"
        fill="currentColor"
        width="800px"
        height="800px"
        viewBox="2 3 20 18"
        id="fast-backward-2"
        data-name="Flat Color"
        xmlns="http://www.w3.org/2000/svg"
        class="icon flat-color"
      >
        <title>Rewind</title>
        <path
          id="primary"
          d="M21.48,4.12a1,1,0,0,0-1,0L15,7.63V5a1,1,0,0,0-1.54-.84l-11,7a1,1,0,0,0,0,1.68l11,7A1,1,0,0,0,14,20a1,1,0,0,0,1-1V16.37l5.46,3.47A1,1,0,0,0,22,19V5A1,1,0,0,0,21.48,4.12Z"
        ></path>
      </svg>
    </div>
    <span v-if="isRewinding" class="rewind-speed"
      >{{ rewindSpeed === "loop" ? 1 : rewindSpeed }}x</span
    >
  </div>
</template>
<style scoped>
.selected,
.rewind-speed {
  color: var(--title-color);
  text-align: center;
}
.rewind-container {
  display: flex;
  overflow: hidden;
  align-items: center;
}
@keyframes move-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
.selected svg {
  animation: move-left var(--animation-duration) linear infinite;
  color: var(--title-color);
  min-width: 100%;
  width: 90%;
  height: 90%;
  flex-shrink: 0;
}
</style>
