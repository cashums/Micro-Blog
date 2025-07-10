<template>
  <div class="post-item">
    <div class="post-details">@{{ username }} on {{ date }} at {{ time }}</div>
    <p>{{ content }}</p>
  </div>
</template>

<script>
export default {
  name: 'PostItem',
  props: {
    username: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.post-item {
  background-color: #d7c2a2;
  padding: 1rem;
  width: 600px;
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
