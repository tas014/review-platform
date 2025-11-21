<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{
  clickFn: () => void;
  isActive: boolean;
}>();
const active = ref(false);
const toggle = () => {
  active.value = !active.value;
  props.clickFn();
};
</script>
<template>
  <div :class="`checkbox-wrapper-7 ${active ? 'active' : ''}`" @click="toggle">
    <!-- <input class="tgl tgl-ios" id="cb2-7" type="checkbox" /> -->
    <label class="tgl-btn" for="cb2-7"></label>
  </div>
</template>

<style scoped>
.checkbox-wrapper-7 {
  display: inline-block;
  --width: 3em;
  --height: 1.3em;
}

.checkbox-wrapper-7 .tgl-btn {
  outline: 0;
  display: block;
  width: var(--width);
  height: var(--height);
  position: relative;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  box-sizing: border-box;

  /* iOS style initial appearance */
  background: #fbfbfb;
  border-radius: var(--height);
  padding: 2px;
  transition: all 0.4s ease;
  border: 1px solid #e8eae9;
}

.checkbox-wrapper-7 .tgl-btn:after,
.checkbox-wrapper-7 .tgl-btn:before {
  position: relative;
  display: block;
  content: "";
  width: 30%;
  height: 100%;
}

.checkbox-wrapper-7 .tgl-btn:after {
  left: 0;
  border-radius: var(--height);
  background: #fbfbfb;
  transition: left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    padding 0.3s ease, margin 0.3s ease;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 0 rgba(0, 0, 0, 0.08);
}

.checkbox-wrapper-7 .tgl-btn:before {
  display: none;
}

/* Active Styles */

.checkbox-wrapper-7.active .tgl-btn:after {
  left: 70%;
  background-color: var(--title-color);
}

.checkbox-wrapper-7.active .tgl-btn {
  background: var(--checkbox-green);
}

.checkbox-wrapper-7 .tgl-btn:hover:after {
  will-change: padding;
}

.checkbox-wrapper-7 .tgl-btn:active {
  box-shadow: inset 0 0 0 2em #e8eae9;
}

.checkbox-wrapper-7 .tgl-btn:active:after {
  padding-right: 0.8em;
}

.checkbox-wrapper-7.active .tgl-btn:active {
  box-shadow: none;
}

.checkbox-wrapper-7.active .tgl-btn:active:after {
  margin-left: -0.8em;
}
</style>
