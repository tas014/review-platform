<script setup lang="ts">
import { inject, ref, computed, Ref } from "vue";
import VideoState from "../../assets/interfaces/VideoState";
import DrawIcon from "../icons/Draw.vue";
import TextIcon from "../icons/Text.vue";
import VoiceIcon from "../icons/Voice.vue";

const { playbackControls } = inject("video") as VideoState;
const { isPlaying } = playbackControls;
const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice"
>;

const container = ref<HTMLElement | null>(null);
const elementX = ref(0);
const elementY = ref(0);
const isOutside = ref(true);

const updateMousePosition = (e: MouseEvent) => {
  if (container.value) {
    const rect = container.value.getBoundingClientRect();
    elementX.value = e.clientX - rect.left;
    elementY.value = e.clientY - rect.top;
  }
};

const onMouseEnter = () => {
  isOutside.value = false;
};

const onMouseLeave = () => {
  isOutside.value = true;
};

const cursorIcon = computed(() => {
  switch (editing.value) {
    case "draw":
      return DrawIcon;
    case "text":
      return TextIcon;
    case "voice":
      return VoiceIcon;
    default:
      return null;
  }
});

const showCursor = computed(() => {
  return editing.value !== null && !isOutside.value && cursorIcon.value;
});

const cursorStyle = computed(() => ({
  left: `${elementX.value}px`,
  top: `${elementY.value}px`,
}));
</script>

<template>
  <div
    ref="container"
    :class="[
      'video-container',
      { playing: isPlaying, 'custom-cursor': showCursor },
    ]"
    @mousemove="updateMousePosition"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div v-if="showCursor" class="cursor-follower" :style="cursorStyle">
      <component :is="cursorIcon" class="icon" />
    </div>
    <slot name="video"></slot>
  </div>
</template>

<style scoped>
.video-container {
  height: 70vh;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.playing {
  box-sizing: border-box;
  border: solid 3px var(--light-green);
}

.video-container.custom-cursor {
  cursor: none;
}

.cursor-follower {
  position: absolute;
  pointer-events: none;
  color: white; /* Icons might use currentColor */
  /* Remove background and padding if we just want the icon, 
     or keep it if we want the icon inside a box. 
     User said "use the Draw, Text or Voice Icon instead of their respective 'text mode'",
     usually implies just the icon or a cleaner look. 
     I'll keep it minimal or remove the dark background if it interferes with the icon.
     Let's keep it simple first. */
  transform: translate(-50%, -50%); /* Center the icon on cursor */
  z-index: 100;
}

.icon {
  width: 24px;
  height: 24px;
  filter: drop-shadow(
    0px 0px 2px rgba(0, 0, 0, 0.8)
  ); /* Make it visible on any background */
}
</style>
