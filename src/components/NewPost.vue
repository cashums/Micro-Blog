<template>
  <div v-if="currentUser" class="post-input">
    <h3>Create a Post</h3>
    <textarea
      v-model="content"
      placeholder="What's on your mind?"
      rows="3"
      class="post-textarea"
    ></textarea>
    <button @click="handlePost" class="post-btn">Post</button>
  </div>
</template>

<script>
import { auth, firestore } from '@/firebaseResources.js'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, addDoc, collection, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'

export default {
  name: "NewPost",

  data() {
    return {
      currentUser: null,
      content: ""
    }
  },

  mounted() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user
    })
  },

  methods: {
    async handlePost() {
      if (this.content.trim() === "") {
        alert("Post cannot be empty.")
        return
      }

      if (!this.currentUser) {
        alert("You must be logged in to post.")
        return
      }

      try {
        const postData = {
          timestamp: new Date(),
          author: this.currentUser.email,
          content: this.content
        }

        const postRef = await addDoc(collection(firestore, "posts"), postData)
        const postId = postRef.id

        await updateDoc(doc(firestore, "users", this.currentUser.uid), {
          posts: arrayUnion(postId)
        })

        await this.addToFollowerFeeds(postId)

        console.log('Post created successfully!')
        this.content = ""
      }
      catch (error) {
        console.error('Error creating post:', error)
        alert('Failed to create post. Please try again.')
      }
    },

    async addToFollowerFeeds(postId) {
      try {
        const userDoc = await getDoc(doc(firestore, "users", this.currentUser.uid))
        const followers = userDoc.data()?.followers || []

        const updatePromises = followers.map(followerId =>
          updateDoc(doc(firestore, "users", followerId), {
            feed: arrayUnion(postId)
          })
        )

        await Promise.all(updatePromises)
      }
      catch (error) {
        console.error('Error updating follower feeds:', error)
      }
    }
  }
}
</script>

<style scoped>
h3 {
  font-family: Helvetica, sans-serif;
  font-weight: bold;
  font-style: italic;
  color: black;
  margin-bottom: 0.5rem;
}

.post-input {
  background-color: #d7c2a2;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  width: 300px;
  box-sizing: border-box;
}

.post-textarea {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  resize: vertical;
  font-size: 1rem;
}

.post-btn {
  padding: 0.5rem 1rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.post-btn:hover {
  background-color: #333;
}
</style>
