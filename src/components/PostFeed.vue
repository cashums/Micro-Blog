<template>
  <div class="post-feed">
    <div v-if="loading">Loading posts...</div>
    <div v-else-if="posts.length === 0">Nothing has been posted yet.</div>
    <div v-else>
      <PostItem
        v-for="post in posts"
        :key="post.id"
        :post="post"
      />
    </div>
  </div>
</template>

<script>
import { auth, firestore } from '@/firebaseResources.js'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import PostItem from './PostItem.vue'

export default {
  name: 'PostFeed',

  components: {
    PostItem
  },

  data() {
    return {
      currentUser: null,
      posts: [],
      loading: true
    }
  },

  mounted() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user
      await this.loadPosts()
    })
  },

  methods: {
    async loadPosts() {
      this.loading = true

      try {
        if (this.currentUser) {
          await this.loadUserFeedPosts()
        }
        else {
          await this.loadRecentPosts()
        }
      }
      catch (error) {
        console.error('Error loading posts:', error)
        this.posts = []
      }
      finally {
        this.loading = false
      }
    },

    async loadRecentPosts() {
      try {
        // Get 10 most recent posts from all posts
        const postsQuery = query(
          collection(firestore, "posts"),
          orderBy("timestamp", "desc"),
          limit(10)
        )

        const querySnapshot = await getDocs(postsQuery)
        this.posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      }
      catch (error) {
        console.error('Error loading recent posts:', error)
        this.posts = []
      }
    },

    async loadUserFeedPosts() {
      try {
        // get current user's feed array
        const userDoc = await getDoc(doc(firestore, "users", this.currentUser.uid))
        const userData = userDoc.data()
        const feedPostIds = userData?.feed || []

        if (feedPostIds.length === 0) {
          this.posts = []
          return
        }

        // get the actual post documents
        const postsQuery = query(
          collection(firestore, "posts"),
          where("__name__", "in", feedPostIds.slice(0, 10))
        )

        const querySnapshot = await getDocs(postsQuery)
        this.posts = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate()) // sort by newest first
          .slice(0, 10)
      }
      catch (error) {
          console.error('Error loading user feed posts:', error)
          this.posts = []
      }
    }
  },

  watch: {
    currentUser: {
      handler() {
        this.loadPosts()
      }
    }
  }
}
</script>

<style scoped>
.post-feed {
  background-color: #d7c2a2;
  padding: 1rem;
  width: 750px;
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
