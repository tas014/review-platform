<script setup lang="ts">
import { computed, inject, type Ref } from "vue";
import DrawIcon from "../icons/Draw.vue";

const editing = inject("editing") as Ref<
  null | "draw" | "trim" | "text" | "voice"
>;
const activeColor = inject("activeColor") as Ref<string>;

const isToggled = computed(() => editing.value === "draw");

const toggleDrawMode = () => {
  if (isToggled.value) {
    editing.value = null;
  } else {
    editing.value = "draw";
  }
};

const setActiveColor = (color: string) => {
  activeColor.value = color;
};
</script>
<template>
  <li
    @click="toggleDrawMode"
    :class="{ 'selected-tool': isToggled }"
    class="draw-mode-container"
  >
    <div class="draw-info">
      <span class="tool-name">Draw</span>
      <DrawIcon
        class="draw-icon"
        :style="{ color: isToggled ? activeColor : '' }"
      />
    </div>
    <div v-if="isToggled" class="colors" @click.stop>
      <div
        class="color-picker red"
        :class="{ 'active-color': activeColor === 'red' }"
        @click.stop="setActiveColor('red')"
      ></div>
      <div
        class="color-picker green"
        :class="{ 'active-color': activeColor === 'green' }"
        @click.stop="setActiveColor('green')"
      ></div>
      <div
        class="color-picker magenta"
        :class="{ 'active-color': activeColor === 'magenta' }"
        @click.stop="setActiveColor('magenta')"
      ></div>
      <div
        class="color-picker yellow"
        :class="{ 'active-color': activeColor === 'yellow' }"
        @click.stop="setActiveColor('yellow')"
      ></div>
    </div>
  </li>
</template>
<style scoped>
.tool-name {
  cursor: pointer;
}
.toggled {
  color: var(--green);
}
.draw-mode-container {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
}
.draw-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.draw-icon {
  width: 2.5rem;
  height: 2.5rem;
}
.colors {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: repeat(4, 1fr);
  width: 16rem;
  height: 3rem;
  gap: 1rem;
}
.color-picker {
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.color-picker:hover,
.active-color {
  border: solid 2px var(--title-color);
}
.color-picker:hover::after {
  content: "";
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background-color: rgba(255, 255, 255, 0.3);
}
.red {
  background-color: red;
}
.green {
  background-color: green;
}
.magenta {
  background-color: magenta;
}
.yellow {
  background-color: yellow;
}
</style>
