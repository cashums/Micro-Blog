<script setup>
import { useRoute } from 'vue-router'
import { posts } from '../stores/posts'
import UserStats from '../components/UserStats.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'
import PostFeed from '../components/PostFeed.vue'

const route = useRoute()
const userId = Number(route.params.id)

const store = posts()

const viewedUser = store.getUserById(userId)
const userPosts = store.getPostsByUser(userId)
</script>

<template>
  <main class="page-layout">
    <div class="sidebar">
      <UserStats
        :userId=viewedUser.id
      />
    </div>
    <div class="main-feed">
      <PostFeed
        :posts=userPosts
      />
    </div>
    <div class="suggested-followers">
      <SuggestedFollowers :userId="viewedUser.id" />
    </div>
  </main>
</template>

<!-- <style scoped>

</style> -->
