<template>
  <div class="video-placeholder-container">
    <span class="video-placeholder-message"
      >Select a video file to replay!</span
    >
  </div>
</template>
<style scoped>
.video-placeholder-container {
  height: 70vh;
  display: grid;
  place-content: center;
  background-color: var(--dark-green);
}
.video-placeholder-message {
  color: var(--title-color);
  font-size: var(--mode-size);
}
</style>
