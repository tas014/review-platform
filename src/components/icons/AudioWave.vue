<script setup lang="ts">
defineProps({
  isPlaying: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <div class="audio-wave">
    <span
      v-for="i in 7"
      :key="i"
      :class="`${isPlaying ? 'playing' : 'wave'}`"
    ></span>
  </div>
</template>
<style scoped>
.audio-wave {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  height: 2rem;
}
.wave,
.playing {
  width: 1rem;
  background-color: #fff;
  border-radius: 2rem;
  transition: height 0.3s linear;
}

.playing {
  animation: wave 1s linear infinite;
  height: 100%;
}

@keyframes wave {
  50% {
    height: 20%;
  }
}
.wave:nth-child(1) {
  height: 20%;
}
.wave:nth-child(2) {
  height: 60%;
}
.wave:nth-child(3) {
  height: 40%;
}
.wave:nth-child(4) {
  height: 80%;
}
.wave:nth-child(5) {
  height: 40%;
}
.wave:nth-child(6) {
  height: 60%;
}
.wave:nth-child(7) {
  height: 20%;
}

.playing:nth-child(1) {
  animation-delay: 0.1s;
}
.playing:nth-child(2) {
  animation-delay: 0.3s;
}
.playing:nth-child(3) {
  animation-delay: 0.6s;
}
.playing:nth-child(4) {
  animation-delay: 0.9s;
}
.playing:nth-child(5) {
  animation-delay: 0.6s;
}
.playing:nth-child(6) {
  animation-delay: 0.3s;
}
.playing:nth-child(7) {
  animation-delay: 0.1s;
}
</style>
