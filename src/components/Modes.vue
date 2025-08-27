<template>
  <header>
    <div class="wrapper">
      <div class="mode-container">
        <h1>Replay Mode</h1>
      </div>
      <div class="mode-container">
        <h1>Analysis Mode</h1>
      </div>
    </div>
  </header>
</template>
<style scoped>
header {
  height: 5vh;
}
.wrapper {
  border-bottom-left-radius: 25%;
  border-bottom-right-radius: 25%;
  background-color: var(--dark-green);
  padding: 1rem;
}
.mode-container {
  display: grid;
  place-content: center;
}
</style>
