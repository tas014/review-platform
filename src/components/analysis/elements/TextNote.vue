<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
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
  (e: "update:dimensions", dimensions: { width: number; height: number }): void;
}>();

const text = defineModel<string>();
const textarea = ref<HTMLTextAreaElement | null>(null);
let resizeObserver: ResizeObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const isManualResizing = ref(false);
const isVisible = ref(true);

// Track drag start position to differentiate between click and drag
const startPos = { x: 0, y: 0 };

const handleIconMouseDown = (event: MouseEvent) => {
  startPos.x = props.x;
  startPos.y = props.y;
  emit("dragStart", event);
};

const handleIconClick = () => {
  // If position hasn't changed (much), consider it a click -> toggle
  if (
    Math.abs(props.x - startPos.x) < 0.1 &&
    Math.abs(props.y - startPos.y) < 0.1
  ) {
    isVisible.value = !isVisible.value;
  }
};

const stylePosition = computed(() => ({
  position: "absolute" as const,
  left: `${props.x}%`,
  top: `${props.y}%`,
  maxWidth: `${100 - props.x}%`,
  maxHeight: `${100 - props.y}%`,
}));

// Use CSS variables for width/height. Apply to CONTAINER.
const styleDimensions = computed(() => ({
  "--text-width": `${props.dimensions.width}%`,
  "--text-height": `${props.dimensions.height}%`,
}));

const clearInlineStyles = () => {
  if (textarea.value) {
    // Only clear if they exist to avoid triggering observers unnecessarily
    if (textarea.value.style.width) textarea.value.style.width = "";
    if (textarea.value.style.height) textarea.value.style.height = "";
  }
};

// When props update, if we are NOT manually resizing, ensure inline styles are cleared
// so the element tracks the prop-based % size (responsiveness).
watch(
  () => props.dimensions,
  () => {
    if (!isManualResizing.value) {
      nextTick(() => {
        clearInlineStyles();
      });
    }
  },
  { deep: true },
);

const onResize = (entries: ResizeObserverEntry[]) => {
  const entry = entries[0];
  if (!entry || !textarea.value) return;

  // Only run logic if inline styles are present (native resize in progress)
  if (!textarea.value.style.width && !textarea.value.style.height) return;

  const videoContainer = textarea.value.closest(".video-container");

  if (videoContainer) {
    const parentRect = videoContainer.getBoundingClientRect();

    // 1. Get Textarea Dimensions (User's active resize target)
    // We used to trust borderBoxSize, but since we need to sum siblings,
    // let's grab standardgetBoundingClientRect for consistency with siblings.
    const textareaRect = textarea.value.getBoundingClientRect();
    let totalWidth = textareaRect.width;
    let totalHeight = textareaRect.height; // Usually container height follows textarea height in this layout

    // 2. Add Sibling (Drag Handle) Width and Gap
    const container = textarea.value.parentElement;
    if (container) {
      // We know structure is [Handle, Textarea].
      // Or we can just sum children?
      // Let's use computed style for gap to be robust.
      const style = window.getComputedStyle(container);
      const gap = parseFloat(style.gap) || 0;

      // Find the handle (sibling)
      const handle = textarea.value.previousElementSibling;
      if (handle) {
        const handleRect = handle.getBoundingClientRect();
        totalWidth += handleRect.width + gap;
        // Height: max(textarea, handle)?
        // If we want container height, usually we want it to encompass the textarea resize.
        // If handle is taller, then container min-height is handle.
        // But we are setting 'dimensions.height' which sets '--text-height'.
        // If we set --text-height to textarea height, and handle is taller, container will likely stretch if overflow visible?
        // Actually, let's assume we want to track the textarea's requested height.
        // If textarea < handle, container = handle.
        // If we store strictly textarea height, container shrinks, handle overflows?
        // Let's explicitly track max height to keep container wrapping correctly?
        // Or just track textarea height and let CSS handle?
        // User said: "dimensions should be set on the container div".
        // So if I resize textarea to be huge, container should be huge.
        // If I resize textarea to be tiny... container should be at least handle size?
        // totalHeight = Math.max(totalHeight, handleRect.height);
        // ^ This is safer.
      }
    }

    const widthPercent = Number(
      ((totalWidth / parentRect.width) * 100).toFixed(4),
    );
    const heightPercent = Number(
      ((totalHeight / parentRect.height) * 100).toFixed(4),
    );

    // Tolerance check
    const currentW = props.dimensions.width;
    const currentH = props.dimensions.height;

    // Heuristic: If we are close, do nothing? (Sync check)
    // Actually, if using inline styles, we definitely want to check if the RESULTING percent
    // is consistent with the stored percent.
    if (
      Math.abs(widthPercent - currentW) <= 0.05 &&
      Math.abs(heightPercent - currentH) <= 0.05
    ) {
      return;
    }

    isManualResizing.value = true;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      emit("update:dimensions", { width: widthPercent, height: heightPercent });
    }, 50);
  }
};

const onMouseUp = () => {
  if (!textarea.value) return;

  // Check if we have inline styles to clear (user was resizing)
  if (textarea.value.style.width || textarea.value.style.height) {
    const videoContainer = textarea.value.closest(".video-container");
    if (videoContainer) {
      const parentRect = videoContainer.getBoundingClientRect();
      const textareaRect = textarea.value.getBoundingClientRect();
      let totalWidth = textareaRect.width;
      let totalHeight = textareaRect.height;

      const container = textarea.value.parentElement;
      if (container) {
        const style = window.getComputedStyle(container);
        const gap = parseFloat(style.gap) || 0;
        const handle = textarea.value.previousElementSibling;
        if (handle) {
          const handleRect = handle.getBoundingClientRect();
          totalWidth += handleRect.width + gap;
        }
      }

      let w = Number(((totalWidth / parentRect.width) * 100).toFixed(4));
      let h = Number(((totalHeight / parentRect.height) * 100).toFixed(4));

      // Clamp before final emit
      w = Math.min(w, 100 - props.x);
      h = Math.min(h, 100 - props.y);

      // Emit final state.
      // IMPORTANT: The watcher will clear inline styles when this prop update comes back.
      emit("update:dimensions", { width: w, height: h });
    }
  }
};

onMounted(() => {
  if (textarea.value) {
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(textarea.value);
  }
  window.addEventListener("mouseup", onMouseUp);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  window.removeEventListener("mouseup", onMouseUp);
});
</script>

<template>
  <div class="text-note-container" :style="[stylePosition, styleDimensions]">
    <div class="drag-handle-container">
      <Text
        class="drag-handle"
        @mousedown="handleIconMouseDown"
        @click="handleIconClick"
      />
    </div>
    <textarea
      v-if="isVisible"
      ref="textarea"
      v-model="text"
      placeholder="Type here..."
      class="text-note"
    ></textarea>
  </div>
</template>

<style scoped>
/* Ensure consistent box model */
* {
  box-sizing: border-box;
}

.text-note-container {
  display: flex;
  gap: 1rem;
  /* Apply dimensions here, driven by props/vars */
  width: var(--text-width);
  height: var(--text-height);
}

.drag-handle-container {
  height: 5rem;
  width: 5rem;
  display: flex;
  align-items: center;
  /* Fixed size, doesn't shrink */
  flex-shrink: 0;
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
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 150px;
  /* Removed max-width/max-height constraints to allow container to dictate? */
  /* Or keep them? */
  /* User didn't specify removal, but 'width: 100%' implies it fills. */
  overflow-y: scroll;

  /* Flex grow/shrink must be disabled to allow native resize to control dimensions
     without being overridden by the container size */
  flex-grow: 0;
  flex-shrink: 0;
  /* Subtract handle (5rem) + gap (1rem) to avoid overflow */
  width: calc(100% - 6rem);
  height: 100%;

  /* IMPORTANT: Enable native resize so user can drag */
  resize: both;
}
</style>
```
