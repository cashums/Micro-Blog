<script>
import { firestore } from '@/firebaseResources.js'
import { doc, getDoc } from 'firebase/firestore'
import UserStats from '../components/UserStats.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'
import PostFeed from '../components/PostFeed.vue'

export default {
  name: "UserProfileView",

  components: {
    UserStats,
    SuggestedFollowers,
    PostFeed
  },

  data() {
    return {
      viewedUser: null,
      loading: true,
      userId: String(this.$route.params.id)
    }
  },

  async mounted() {
    await this.loadUser()
  },

  methods: {
    async loadUser() {
      try {
        const userDoc = await getDoc(doc(firestore, "users", this.userId))
        if (userDoc.exists()) {
          this.viewedUser = {
            id: userDoc.id,
            ...userDoc.data()
          }
        }
        else {
          console.error("User not found")
          this.viewedUser = null
        }
      }
      catch (error) {
        console.error("Error loading user:", error)
        this.viewedUser = null
      }
      finally {
        this.loading = false
      }
    }
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
