<script>
import { auth, firestore } from '@/firebaseResources.js'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore'
import { posts } from '../stores/posts'
import UserStats from '../components/UserStats.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'
import NewPost from '../components/NewPost.vue'

export default {
  name: "HomeView",

  components: {
    UserStats,
    PostFeed,
    SuggestedFollowers,
    NewPost
  },

  data() {
    return {
      currentUser: null,
      userFeedPosts: [],
      unsubscribe: null,
      store: posts() // Keep the store for now
    }
  },

  computed: {
    allPosts() {
      return this.store.posts
    }
  },

  mounted() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user
    })
  }
}
</script>

<template>
  <main class="page-layout">
    <div class="sidebar">
      <UserStats :userId="currentUser?.id" />
    </div>

    <div class="main-feed">
      <NewPost v-if="currentUser" />
      <PostFeed :posts="allPosts" />
    </div>

    <div class="suggested-followers">
      <SuggestedFollowers
      />
    </div>
  </main>
</template>
