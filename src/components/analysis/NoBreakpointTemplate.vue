<template>
  <div class="no-breakpoint-wrapper">
    <h1>No breakpoint detected</h1>
    <p>Create or select a breakpoint to use the analysis tools!</p>
  </div>
</template>
<style scoped>
.no-breakpoint-wrapper {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  background-color: rgba(0, 0, 0, 0.8);
  top: 0%;
  left: 0%;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.no-breakpoint-wrapper h1,
.no-breakpoint-wrapper p {
  text-align: center;
}
h1 {
  font-size: var(--analysis-section-title-size);
}
p {
  font-size: var(--mode-size);
  color: rgb(100, 100, 100);
}
</style>
