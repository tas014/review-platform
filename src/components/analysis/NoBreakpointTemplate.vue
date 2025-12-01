<template>
  <div class="wrapper">
    <h1>No breakpoints detected</h1>
    <p>Create a breakpoint to use the analysis tools</p>
  </div>
</template>
<style scoped>
.wrapper {
  display: grid;
  place-items: center;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.3);
  top: 0%;
  left: 0%;
  width: 100%;
  height: 100%;
  z-index: 2;
}
h1 {
  font-size: var(--analysis-section-title-size);
}
p {
  font-size: var(--mode-size);
  color: rgb(100, 100, 100);
}
</style>
