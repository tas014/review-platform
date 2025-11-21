<script setup lang="ts">
import Checkbox from "../Checkbox.vue";
import { ref } from "vue";

const isToggled = ref(false);

const toggleTrimMode = () => {
  console.log("Trim Mode active");
};
</script>
<template>
  <li>
    <span class="tool-name">Trim Mode</span>
    <Checkbox :clickFn="toggleTrimMode" :isActive="isToggled" />
  </li>
</template>
