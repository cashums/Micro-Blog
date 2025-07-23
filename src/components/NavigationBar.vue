<template>
  <header>
    <nav>
      <RouterLink to="/">
        <img
          src="C:\Users\nukac\Documents\CS110\src\assets\logo.png"
          alt="CapsLock"
          class="logo"
        />
      </RouterLink>
      <RouterLink to="/">HOME</RouterLink>
      <RouterLink to="/archiveWizard" v-if="currentUser">ARCHIVES</RouterLink>
      <RouterLink to="/timeline">TIMELINE</RouterLink>
      <RouterLink @click="handleAuthAction">
        {{ currentUser ? "LOG OUT" : "LOGIN" }}
      </RouterLink>
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
    async handleAuthAction() {
      if (this.currentUser) {
        // Log out the user
        try {
          await signOut(auth);
          this.$router.push("/login");
        } 
        catch (error) {
          console.error("Logout error: ", error);
        }
      } 
      else {
        // Redirect to login page
        this.$router.push("/login");
      }
    },

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
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: white;
    border-bottom: 1px solid #ddd;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .logo {
    height: 50px;
    width: auto;
    margin: 0;
    padding: 0;
  }

  nav a {
    margin-right: 1.5rem;
    font-family: Helvetica, sans-serif;
    font-weight: bold;
    font-style: italic;
    color: black;
  }

  nav a:hover {
    text-decoration: underline;
  }
</style>
