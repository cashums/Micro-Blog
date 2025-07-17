
<template>
  <main class="page-layout">
    <div class="sidebar">
      <UserStats />
    </div>

    <div class="main-feed">
      <PostFeed />
    </div>

    <div class="post-input">
      <NewPost v-if="currentUser" />
    </div>

    <div class="suggested-followers">
      <SuggestedFollowers />
    </div>
  </main>
</template>

<script>
import { auth } from '@/firebaseResources.js'
import { onAuthStateChanged } from 'firebase/auth'
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
      currentUser: null
    }
  },

  mounted() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user
    })
  }
}
</script>
