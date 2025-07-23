<template>
  <div id="app">
    <header>
      <NavigationBar />
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script>
import { RouterView } from "vue-router";
import NavigationBar from "./components/NavigationBar.vue";

export default {
  name: "App",

  components: {
    RouterView,
    NavigationBar
  }
};
</script>

<style>
  body {
    background-color: white;
  }

  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  .page-layout {
    display: grid;
    margin-top: 150px;
    grid-template-rows: 100px 100px 100px 100px 100px 100px 100px 100px 100px 100px;
    grid-template-columns: 100px 100px 100px 100px 100px 100px 100px 100px 100px 100px;
    gap: 0.5rem;
  }

  /* .post-input {
  grid-row-start: 3;
  grid-column-start: 1;
} */

  .post-input {
    grid-row-start: 2;
    grid-column-start: 1;
  }

  .sidebar {
    grid-row-start: 1;
    grid-column-start: 1;
  }

  .main-feed {
    grid-row-start: 1;
    grid-column-start: 4;
  }

  .suggested-followers {
    grid-row-start: 1;
    grid-column-start: 9;
  }

  .placeholder-text {
    font-family: Courier, sans-serif;
    font-weight: bold;
    color: black;
    text-decoration: none;
  }
</style>

<style scoped>
  header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    /* display: flex; */
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    /* background-color: white; */
    z-index: 1000;
    height: 150px;
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
