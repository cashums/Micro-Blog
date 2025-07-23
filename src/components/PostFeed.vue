<template>
  <div class="post-feed">
    <div class="placeholder-text" v-if="loading">Loading posts...</div>
    <div class="placeholder-text" v-else-if="posts.length === 0">
      Nothing has been posted yet.
    </div>
    <div v-else>
      <PostItem v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<script>
import { auth, firestore } from "@/firebaseResources.js";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  getDocs
} from "firebase/firestore";
import PostItem from "./PostItem.vue";

export default {
  name: "PostFeed",

  components: {
    PostItem
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
      posts: [],
      loading: true,
      unsubscribe: null // To manage real-time listener
    };
  },

  mounted() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      this.setupRealTimeFeed();
    });
  },

  methods: {
    setupRealTimeFeed() {
      if (this.unsubscribe) {
        this.unsubscribe(); // Clean up previous listener
      }

      this.loading = true;

      if (this.userId) {
        const userDocRef = doc(firestore, "users", this.userId);
        this.unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
          const userPostIds = userDoc.data()?.posts || [];
          if (userPostIds.length > 0) {
            const postsQuery = query(
              collection(firestore, "posts"),
              where("__name__", "in", userPostIds.slice(0, 10)),
              orderBy("timestamp", "desc") // Ensure most recent posts are at the top
            );
            const querySnapshot = await getDocs(postsQuery);
            this.posts = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));
          }
          else {
            this.posts = [];
          }
          this.loading = false;
        });
      }
      else if (this.currentUser) {
        const userDocRef = doc(firestore, "users", this.currentUser.uid);
        this.unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
          const feedPostIds = userDoc.data()?.feed || [];
          if (feedPostIds.length > 0) {
            const postsQuery = query(
              collection(firestore, "posts"),
              where("__name__", "in", feedPostIds.slice(0, 10)),
              orderBy("timestamp", "desc") // Ensure most recent posts are at the top
            );
            const querySnapshot = await getDocs(postsQuery);
            this.posts = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));
          }
          else {
            this.posts = [];
          }
          this.loading = false;
        });
      }
      else {
        const postsQuery = query(
          collection(firestore, "posts"),
          orderBy("timestamp", "desc"), // Already correct for general feed
          limit(10)
        );
        this.unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
          this.posts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          this.loading = false;
        });
      }
    }
  },

  watch: {
    currentUser: {
      handler() {
        this.setupRealTimeFeed();
      }
    },
    userId: {
      handler() {
        this.setupRealTimeFeed();
      }
    }
  },

  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe(); // Clean up listener on component unmount
    }
  }
};
</script>

<style scoped>
  .post-feed {
    background-color: #d7c2a2;
    padding: 1rem;
    width: 500px;
    text-align: center;
    border-radius: 12px;
  }

  .post-feed p {
    font-family: Courier, sans-serif;
    font-weight: bold;
    color: black;
    text-decoration: none;
  }
</style>
