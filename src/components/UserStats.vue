<template>
  <div class="user-stats">
    <div v-if="user">
      <div class="username">{{ user.email.toUpperCase() }}</div>
      <div class="stats-row">
        <div class="stat">
          POSTS <br />
          {{ user.posts?.length || 0 }}
        </div>
        <div class="stat">
          FOLLOWING <br />
          {{ user.following?.length || 0 }}
        </div>
        <div class="stat">
          FOLLOWERS <br />
          {{ user.followers?.length || 0 }}
        </div>
      </div>
    </div>
    <div v-else>
      <RouterLink to="/login">Log In</RouterLink>
    </div>
  </div>
</template>

<script>
import { RouterLink } from "vue-router";
import { auth, firestore } from "@/firebaseResources.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default {
  name: "UserStats",

  components: {
    RouterLink
  },

  props: {
    userId: {
      type: String,
      required: false
    }
  },

  data() {
    return {
      currentUser: null,
      user: null,
      loading: true
    };
  },

  async mounted() {
    onAuthStateChanged(auth, async (authUser) => {
      this.currentUser = authUser;
      await this.loadUserData();
    });
  },

  methods: {
    async loadUserData() {
      try {
        if (this.userId) {
          const userDoc = await getDoc(doc(firestore, "users", this.userId));
          if (userDoc.exists()) {
            this.user = {
              id: userDoc.id,
              ...userDoc.data()
            };
          }
          else {
            this.user = null;
          }
        }
        else if (this.currentUser) {
          const userDoc = await getDoc(
            doc(firestore, "users", this.currentUser.uid)
          );
          if (userDoc.exists()) {
            this.user = {
              id: userDoc.id,
              ...userDoc.data()
            };
          }
          else {
            this.user = null;
          }
        }
        else {
          this.user = null;
        }
      }
      catch (error) {
        console.error("Error loading user data:", error);
        this.user = null;
      }
      finally {
        this.loading = false;
      }
    }
  },

  watch: {
    userId: {
      handler() {
        this.loadUserData();
      }
    }
  }
};
</script>

<style scoped>
  .user-stats {
    background-color: #d7c2a2;
    padding: 1rem;
    width: 300px;
    text-align: center;
    border-radius: 12px;
  }

  .username {
    text-align: center;
    font-family: Helvetica, sans-serif;
    font-weight: bold;
    font-style: italic;
    color: navy;
  }

  .user-stats p,
  .user-stats a {
    font-family: Courier, sans-serif;
    font-weight: bold;
    color: black;
    text-decoration: none;
  }

  .user-stats a:hover {
    text-decoration: underline;
  }

  .stats-row {
    display: flex;
    justify-content: space-around;
    text-align: center;
  }

  .stat {
    font-family: Courier, sans-serif;
    color: black;
    text-decoration: none;
  }
</style>
