<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
    </nav>
  </header>
</template>

<script>
</script>

<style scoped>
nav {
  position: fixed;
  left: 175px;
  top: 50px;
}

nav a {
  margin-right: 1.5rem;
  font-family: Helvetica, sans-serif;
  font-weight: bold;
  font-style: italic;
  color: black;
}
</style>
