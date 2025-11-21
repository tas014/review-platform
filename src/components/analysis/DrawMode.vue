<script setup lang="ts">
import Checkbox from "../Checkbox.vue";
import { ref } from "vue";

const isToggled = ref(false);

const toggleDrawMode = () => {
  console.log("Draw Mode active");
};
</script>
<template>
  <li>
    <span class="tool-name">Draw Mode</span>
    <Checkbox :clickFn="toggleDrawMode" :isActive="isToggled" />
  </li>
</template>
