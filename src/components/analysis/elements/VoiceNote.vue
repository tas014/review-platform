<script setup lang="ts">
import { computed } from "vue";
import VoiceIcon from "../../icons/Voice.vue";
import AudioWaveIcon from "../../icons/AudioWave.vue";

const props = defineProps<{
  x: number;
  y: number;
}>();

// Assuming the model might store the audio file URL or some metadata
const voiceData = defineModel<any>();

const emit = defineEmits<{
  (e: "dragStart", event: MouseEvent): void;
}>();

const stylePosition = computed(() => ({
  position: "absolute" as const,
  left: `${props.x}%`,
  top: `${props.y}%`,
}));
</script>

<template>
  <div class="voice-note" :style="stylePosition">
    <div class="icon-wrapper" @mousedown="$emit('dragStart', $event)">
      <VoiceIcon class="voice-icon" />
    </div>
    <div class="wave-wrapper">
      <AudioWaveIcon class="wave-icon" />
    </div>
  </div>
</template>

<style scoped>
.voice-note {
  display: flex;
  align-items: center;
  background-color: var(--dark-grey, #333);
  padding: 8px 12px;
  border-radius: 20px;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  color: white;
  width: fit-content;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
}

.icon-wrapper:active {
  cursor: grabbing;
}

.voice-icon {
  width: 20px;
  height: 20px;
}

.wave-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.wave-icon {
  width: 40px;
  height: 20px;
  color: var(--light-green, #4ade80);
}
</style>
