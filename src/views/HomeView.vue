<script setup>
import { computed } from 'vue'
import { posts } from '../stores/posts'
import UserStats from '../components/UserStats.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'
import NewPost from '../components/NewPost.vue'

const store = posts()

const allPosts = store.posts
const currentUser = computed(() =>
  store.users.find(user => user.username === store.currentUser)
)
// const suggestedUsers = computed(() =>
//   store.users.filter(user => user.username !== store.currentUser)
// )
</script>

<template>
  <main class="page-layout">
    <div class="sidebar">
      <UserStats :userId="currentUser?.id" />
    </div>

    <div class="main-feed">
      <NewPost v-if="store.isLoggedIn" />
      <PostFeed :posts="allPosts" />
    </div>

    <div class="suggested-followers">
      <SuggestedFollowers
      />
    </div>
  </main>
</template>
