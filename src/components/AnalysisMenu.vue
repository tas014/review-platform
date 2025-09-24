<script setup lang="ts">
import Checkbox from "./Checkbox.vue";

const clicker = () => {
  console.log("I've been clicked");
};
</script>
<template>
  <section>
    <div class="analysis-menu">
      <h1>Analysis Menu</h1>
      <div>
        <h3>Edit</h3>
        <ul class="tool-list">
          <li>
            <span>Trim Mode</span>
            <Checkbox :clickFn="clicker" />
          </li>
        </ul>
      </div>
      <div>
        <h3>Tools</h3>
        <ul class="tool-list">
          <li>
            <span>Draw Mode</span>
            <Checkbox :clickFn="clicker" />
          </li>
          <li>
            <span>Add Text Note</span>
            <i class="pi pi-microphone"></i>
          </li>
          <li>Add Voice Recording</li>
        </ul>
      </div>
    </div>
    <div class="analysis-buttons">
      <button>Delete All breakpoints</button>
      <button>Export Analysis File</button>
    </div>
  </section>
</template>
<style scoped>
section {
  position: absolute;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 0%;
  right: 0%;
  width: 27vw;
  height: 100vh;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.4);
  border-left: solid 2px var(--light-green);
}
.tool-list {
  list-style: none;
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
  padding-left: 0px;
}
.tool-list li {
  display: flex;
}
.tool-list span {
  margin-right: 1rem;
}
h1,
h3 {
  color: var(--title-color);
  border-bottom: solid 1px var(--title-color);
}
.analysis-menu {
  margin-top: 5vh;
  display: grid;
  gap: 3rem;
}
.analysis-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
