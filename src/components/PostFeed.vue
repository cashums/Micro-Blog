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
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where
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
      loading: true
    };
  },

  mounted() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      await this.loadPosts();
    });
  },

  methods: {
    async loadPosts() {
      this.loading = true;

      try {
        let posts = [];

        if (this.userId) {
          const userDoc = await getDoc(doc(firestore, "users", this.userId));
          const userPostIds = userDoc.data()?.posts || [];

          if (userPostIds.length > 0) {
            const postsQuery = query(
              collection(firestore, "posts"),
              where("__name__", "in", userPostIds.slice(0, 10))
            );
            const querySnapshot = await getDocs(postsQuery);
            posts = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));
          }
        }
        else if (this.currentUser) {
          const userDoc = await getDoc(
            doc(firestore, "users", this.currentUser.uid)
          );
          const feedPostIds = userDoc.data()?.feed || [];

          if (feedPostIds.length > 0) {
            const postsQuery = query(
              collection(firestore, "posts"),
              where("__name__", "in", feedPostIds.slice(0, 10))
            );
            const querySnapshot = await getDocs(postsQuery);
            const allFeedPosts = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }));

            posts = allFeedPosts.filter(
              (post) => post.author !== this.currentUser.email
            );
          }
        }
        else {
          const postsQuery = query(
            collection(firestore, "posts"),
            orderBy("timestamp", "desc"),
            limit(10)
          );
          const querySnapshot = await getDocs(postsQuery);
          posts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
        }

        if (this.userId || this.currentUser) {
          posts.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());
        }

        this.posts = posts.slice(0, 10);
      }
      catch (error) {
        console.error("Error loading posts:", error);
        this.posts = [];
      }
      finally {
        this.loading = false;
      }
    }
  },

  watch: {
    currentUser: {
      handler() {
        this.loadPosts();
      }
    },
    userId: {
      handler() {
        this.loadPosts();
      }
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
