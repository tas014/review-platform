<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Text from "../../icons/Text.vue";

const props = defineProps<{
  x: number;
  y: number;
  dimensions: {
    width: number;
    height: number;
  };
}>();

const emit = defineEmits<{
  (e: "dragStart", event: MouseEvent): void;
}>();

const text = defineModel<string>();
const textarea = ref<HTMLTextAreaElement | null>(null);

const adjustHeight = () => {
  if (textarea.value) {
    textarea.value.style.height = "auto";
    textarea.value.style.height = textarea.value.scrollHeight + "px";
  }
};

const stylePosition = computed(() => ({
  position: "absolute" as const,
  left: `${props.x}%`,
  top: `${props.y}%`,
  maxWidth: `${100 - props.x}%`,
  maxHeight: `${100 - props.y}%`,
}));

const styleDimensions = computed(() => ({
  width: `${props.dimensions.width}%`,
  height: `${props.dimensions.height}%`,
}));

onMounted(() => {
  adjustHeight();
});
</script>

<template>
  <div class="text-note-container" :style="stylePosition">
    <div class="drag-handle-container">
      <Text class="drag-handle" @mousedown="$emit('dragStart', $event)" />
    </div>
    <textarea
      ref="textarea"
      v-model="text"
      placeholder="Type here..."
      @input="adjustHeight"
      class="text-note"
      :style="styleDimensions"
    ></textarea>
  </div>
</template>

<style scoped>
.text-note-container {
  display: flex;
  gap: 1rem;
}

.drag-handle-container {
  height: 5rem;
  width: 5rem;
  display: flex;
  align-items: center;
}

.drag-handle {
  cursor: grab;
  color: var(--title-color);
  font-size: 1rem;
}

.drag-handle:active {
  cursor: grabbing;
}

.text-note {
  background-color: rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 1rem;
  border: 1px solid var(--title-color);
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 150px;
  max-width: 500px;
  max-height: 300px;
  overflow-y: scroll;
}

textarea {
  border: none;
  background: transparent;
  outline: none;
  resize: both;
  font-family: inherit;
  font-size: 1rem;
  color: #333;
  min-height: 1.5em;
  overflow: hidden;
  max-width: 100%;
  max-height: 100%;
}
</style>
