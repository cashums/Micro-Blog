<template>
  <div class="post-feed">
    <p v-if="posts.length === 0">Nothing has been posted yet.</p>
    <div v-else>
      <PostItem
        v-for="(post, index) in posts.slice(0, 10)"
        :key="index"
        :username="post.username"
        :date="post.date"
        :time="post.time"
        :content="post.content"
      />
    </div>
  </div>
</template>

<script>
import PostItem from './PostItem.vue'

export default {
  name: 'PostFeed',
  components: {
    PostItem
  },
  props: {
    posts: {
      type: Array,
      required: true
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
