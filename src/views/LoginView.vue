<template>
  <div class="login-view">
    <LoginBox />
  </div>
</template>

<script setup>
import LoginBox from '../components/LoginBox.vue'
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
</style>
