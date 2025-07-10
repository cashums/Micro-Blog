<template>
  <div class="suggested-followers">
    <p class="title">Users to Follow</p>
    <div v-if="users.length === 0">No one to follow right now.</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id" class="user-entry">
        <RouterLink :to="`/users/${user.id}`">{{ user.username }}</RouterLink>
        <button v-if="isLoggedIn" @click="follow(user)">Follow</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { posts } from '../stores/posts'

const store = posts()

const props = defineProps({
  userId: Number
})

const users = computed(() => {
  if (props.userId) {
    const viewedUser = typeof store.getUserById === 'function'
      ? store.getUserById(props.userId) : null
    if (!viewedUser || viewedUser.username === store.currentUser) return []
    return [viewedUser]
  }

  return store.users.filter(u => u.id !== store.currentUser?.id)
})

const isLoggedIn = computed(() => store.isLoggedIn)

function follow(user) {
  alert(`Followed ${user.username}`)
  user.incrementFollowersCount()
}

console.log('props.userId:', props.userId)
console.log('viewedUser:', store.getUserById(props.userId))
console.log('currentUser:', store.currentUser)
</script>


<style scoped>
.suggested-followers {
  background-color: #d7c2a2;
  padding: 1rem;
  border-radius: 12px;
  width: 290px;
}

.title {
  font-family: Helvetica, sans-serif;
  font-weight: bold;
  font-style: italic;
  color: black;
  margin-bottom: 0.5rem;
}

.user-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.user-entry a {
  color: navy;
  font-family: Courier, sans-serif;
  font-weight: bold;
  text-decoration: none;
}

.user-entry a:hover {
  text-decoration: underline;
}

.user-entry button {
  padding: 0.5rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.user-entry button:hover {
  background-color: #369e6f;
}
</style>
