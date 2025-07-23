<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/archives" v-if="currentUser">Archives</RouterLink>
      <RouterLink to="/timeline">Timeline</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
    </nav>
  </header>
</template>

<script>
import { auth } from "@/firebaseResources.js";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default {
  name: "NavigationBar",

  data() {
    return {
      currentUser: null
    };
  },

  mounted() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  },

  methods: {
    async logout() {
      try {
        await signOut(auth);
        this.$router.push("/login");
      }
      catch (error) {
        console.error("Logout error: ", error);
      }
    }
  }
};
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
