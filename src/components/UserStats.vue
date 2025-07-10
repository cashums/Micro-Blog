<template>
  <div class="user-stats">
    <div v-if="user">
      <div class="username">{{ user.username }}</div>
      <div class="stats-row">
        <div class="stat">
          Posts <br> {{ user.postsCount ?? user.posts?.length ?? 0 }}
        </div>
        <div class="stat">
          Following <br> {{ user.followingCount ?? user.following?.length ?? 0 }}
        </div>
        <div class="stat">
          Followers <br> {{ user.followersCount ?? user.followers?.length ?? 0 }}
        </div>
      </div>
    </div>
    <div v-else>
      <RouterLink to="/login">Log In</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { posts } from '../stores/posts'

const store = posts()

// Props for optional override
const props = defineProps({
  userId: Number, // If provided, show this user's stats
})

// Compute the user to display: viewed user or current user
const user = computed(() => {
  if (props.userId) {
    return store.getUserById(props.userId)
  }
  if (store.isLoggedIn) {
    return store.users.find(u => u.username === store.currentUser)
  }
  return null
})
</script>

<style scoped>
.user-stats {
  background-color: #d7c2a2;
  padding: 1rem;
  width: 300px;
  text-align: center;
  border-radius: 12px;
}

.username {
  text-align: center;
  font-family: Helvetica, sans-serif;
  font-weight: bold;
  font-style: italic;
  color: navy;
}

.user-stats p,
.user-stats a {
  font-family: Courier, sans-serif;
  font-weight: bold;
  color: black;
  text-decoration: none;
}

.user-stats a:hover {
  text-decoration: underline;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat {
  font-family: Courier, sans-serif;
  color: black;
  text-decoration: none;
}

</style>
