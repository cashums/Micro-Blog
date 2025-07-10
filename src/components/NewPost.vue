<template>
  <div v-if="store.isLoggedIn" class="post-input">
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

<script setup>
import { ref } from 'vue'
import { posts } from '../stores/posts'

const store = posts()
const content = ref('')

function handlePost() {
  if (content.value.trim() === '') {
    alert('Post cannot be empty.')
    return
  }

  store.posts.push({
    id: store.posts.length + 1,
    username: store.currentUser,
    userId: store.users.find(u => u.username === store.currentUser)?.id,
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString(),
    content: content.value
  })
  content.value = ''
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
