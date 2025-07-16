<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { firestore } from '@/firebaseResources.js'
import { doc, getDoc } from 'firebase/firestore'
import UserStats from '../components/UserStats.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'
import PostFeed from '../components/PostFeed.vue'

const route = useRoute()
const userId = String(route.params.id)

const viewedUser = ref(null)
const loading = ref(true)

onMounted(async () => {
  await loadUser()
})

async function loadUser() {
  try {
    const userDoc = await getDoc(doc(firestore, "users", userId))
    if (userDoc.exists()) {
      viewedUser.value = {
        id: userDoc.id,
        ...userDoc.data()
      }
    }
    else {
      console.error("User not found")
      viewedUser.value = null
    }
  }
  catch (error) {
    console.error("Error loading user:", error)
    viewedUser.value = null
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="loading">
    Loading user...
  </div>
  <main v-else-if="viewedUser" class="page-layout">
    <div class="sidebar">
      <UserStats :userId="viewedUser.id" />
    </div>
    <div class="main-feed">
      <PostFeed :posts="[]" />
    </div>
    <div class="suggested-followers">
      <SuggestedFollowers :userId="viewedUser.id" />
    </div>
  </main>
  <div v-else>
    User not found
  </div>
</template>

<!-- <style scoped>

</style> -->
