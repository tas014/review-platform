<script setup lang="ts">
import { onMounted, ref } from "vue";

const text = defineModel<string>();
const textarea = ref<HTMLTextAreaElement | null>(null);

const adjustHeight = () => {
  if (textarea.value) {
    textarea.value.style.height = "auto";
    textarea.value.style.height = textarea.value.scrollHeight + "px";
  }
};

onMounted(() => {
  adjustHeight();
});
</script>

<template>
  <div class="text-note">
    <textarea
      ref="textarea"
      v-model="text"
      placeholder="Type here..."
      @input="adjustHeight"
    ></textarea>
  </div>
</template>

<style scoped>
.text-note {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 150px;
  max-width: 300px;
  display: flex;
}

textarea {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  resize: both; /* Allow manual resizing if needed, though auto-height is here */
  font-family: inherit;
  font-size: 1rem;
  color: #333;
  min-height: 1.5em;
  overflow: hidden;
}
</style>
