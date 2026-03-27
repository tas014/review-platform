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
  (e: "update:invertedX", value: boolean): void;
  (e: "update:invertedY", value: boolean): void;
}>();

const invertedX = defineModel<boolean>("invertedX", { default: false });
const invertedY = defineModel<boolean>("invertedY", { default: false });

const text = defineModel<string>();
const textarea = ref<HTMLTextAreaElement | null>(null);
let resizeObserver: ResizeObserver | null = null;
let debounceTimer: number | null = null;
const isManualResizing = ref(false);
const isCollapsed = defineModel<boolean>("isCollapsed", { default: false });
const isVisible = computed(() => !isCollapsed.value);

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
    Math.abs(props.x - startPos.x) < 1.0 &&
    Math.abs(props.y - startPos.y) < 1.0
  ) {
    isCollapsed.value = !isCollapsed.value;
  }
};

const isFlippedX = computed(() => {
  // Check proximity only, ignore persisted invertedX to allow flipping back
  return props.x + props.dimensions.width > 98;
});

const isFlippedY = computed(() => {
  return props.y + props.dimensions.height > 98;
});

// Watch computed flip state and update model if changed (for persistence)
watch(isFlippedX, (newVal) => {
  if (newVal !== invertedX.value) {
    invertedX.value = newVal;
  }
});

watch(isFlippedY, (newVal) => {
  if (newVal !== invertedY.value) {
    invertedY.value = newVal;
  }
});

const stylePosition = computed(() => {
  const style: Record<string, string> = {
    position: "absolute",
  };

  if (isFlippedX.value) {
    // Compensate for icon width (6rem) to keep the visual anchor point consistent
    style.right = `calc(${100 - props.x}% - 6rem)`;
    style.maxWidth = `${props.x}%`;
    style.marginRight = "0";
  } else {
    style.left = `${props.x}%`;
    style.maxWidth = `${100 - props.x}%`;
    style.marginLeft = "0";
  }

  if (isFlippedY.value) {
    style.bottom = `calc(${100 - props.y}% - 6rem)`;
    style.maxHeight = `${props.y}%`;
    style.marginBottom = "0";
  } else {
    style.top = `${props.y}%`;
    style.maxHeight = `${100 - props.y}%`;
    style.marginTop = "0";
  }

  return style;
});

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

// When props update, if we are NOT manually resizing, ensure inline styles are cleared so the element tracks the prop-based % size
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
    const textareaRect = textarea.value.getBoundingClientRect();
    let totalWidth = textareaRect.width;
    let totalHeight = textareaRect.height;

    // Add Sibling (Drag Handle) Width and Gap
    const container = textarea.value.parentElement;
    if (container) {
      const style = window.getComputedStyle(container);
      const gap = parseFloat(style.gap) || 0;

      // When flex-direction is row-reverse (flipped X), the handle is visually on the right
      const handle = textarea.value.previousElementSibling;
      if (handle) {
        const handleRect = handle.getBoundingClientRect();
        totalWidth += handleRect.width + gap;
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
      if (isFlippedX.value) {
        w = Math.min(w, props.x);
      } else {
        w = Math.min(w, 100 - props.x);
      }

      if (isFlippedY.value) {
        h = Math.min(h, props.y);
      } else {
        h = Math.min(h, 100 - props.y);
      }
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
  <div
    class="text-note-container"
    :class="{
      'flipped-x': isFlippedX,
      'flipped-y': isFlippedY,
    }"
    :style="[stylePosition, styleDimensions]"
  >
    <div
      class="drag-handle-container"
      :class="isVisible ? 'active' : 'is-collapsed'"
    >
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
  width: var(--text-width);
  height: var(--text-height);
  z-index: 10;
}

.flipped-x {
  flex-direction: row-reverse;
}

.flipped-y {
  align-items: flex-end;
}

.drag-handle-container {
  height: 6rem;
  width: 6rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.drag-handle {
  cursor: grab;
  height: 6rem;
}

.drag-handle:active {
  cursor: grabbing;
}

.text-note {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 1rem;
  border: 1px solid var(--title-color);
  padding: 1rem;
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 150px;
  min-height: 100px;
  overflow-y: scroll;
  flex-grow: 0;
  flex-shrink: 0;
  width: calc(100% - 6rem);
  height: 100%;
  resize: both;
}

.is-collapsed {
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 5rem;
  color: var(--title-color);
  transition: all 0.2s linear;
}
.is-collapsed:hover,
.active {
  background-color: var(--light-green);
  color: white;
  overflow: hidden;
}
.active {
  border-radius: 5rem;
}
</style>
