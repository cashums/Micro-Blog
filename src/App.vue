<script setup>
import { RouterView } from 'vue-router'
import NavigationBar from './components/NavigationBar.vue'
</script>

<template>
  <header>
    <div id="app">
      <img alt="CapsLock logo" class="logo" src="@/assets/logo.png" width="190" height="125" />
      <NavigationBar/>
      <RouterView/>
    </div>
  </header>
</template>

<style>
body {
  background-color: white;
}

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.post-input {
  position: fixed;
  left: 40px;
  top: 300px;
}

.page-layout {
  display: flex;
}

.sidebar {
  position: fixed;
  left: 40px;
  top: 150px;
}

.main-feed {
  position: fixed;
  left: 400px;
  top: 150px;
}

.suggested-followers {
  position: fixed;
  right: 40px;
  top: 150px;
}

/* .page-layout {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  padding: 2rem 0;
}

.sidebar {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-feed {
  flex: 1 1 600px;
  max-width: 700px;
  min-width: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.suggested-followers {
  flex: 0 0 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
} */
</style>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.logo {
  position: fixed;
  left: 0;
  top: 0;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    /* place-items: center; */
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    margin: 0;
    padding: 0;
  }
}
</style>
