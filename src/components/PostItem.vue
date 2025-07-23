<template>
  <div class="post-item">
    <div class="post-details">
      @{{ post.author }} on {{ formatDate(post.timestamp) }} at
      {{ formatTime(post.timestamp) }}
    </div>
    <p>{{ post.content }}</p>
  </div>
</template>

<script>
export default {
  name: "PostItem",

  props: {
    post: {
      type: Object,
      required: true
    }
  },

  methods: {
    formatDate(timestamp) {
      return timestamp.toDate().toLocaleDateString();
    },

    formatTime(timestamp) {
      return timestamp.toDate().toLocaleTimeString();
    }
  }
};
</script>

<style scoped>
  .post-item {
    background-color: #d7c2a2;
    padding: 1rem;
    width: 480px;
    text-align: left;
    border-radius: 12px;
  }

  .post-item p {
    font-family: Courier, sans-serif;
    font-weight: bold;
    color: black;
    text-decoration: none;
  }

  .post-details {
    font-family: Courier, sans-serif;
    color: black;
    text-decoration: none;
  }

  .post-item a:hover {
    text-decoration: underline;
  }
</style>
