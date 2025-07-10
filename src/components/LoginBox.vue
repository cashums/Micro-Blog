<script setup>
import { ref } from 'vue'
import { posts } from '../stores/posts'

const store = posts()
const mode = ref('login')
const email = ref('')
const password = ref('')

const MOCK_EMAIL = 'test@example.com'
const MOCK_PASSWORD = 'password123'

// Handle login
function handleLogin() {
  if (email.value.trim() === '' || password.value.trim() === '') {
    alert('Please enter email and password')
    return
  }
  // Mock login: only allow test@example.com / password123
  if (email.value === MOCK_EMAIL && password.value === MOCK_PASSWORD) {
    store.login(email.value)
    email.value = ''
    password.value = ''
  }
  else {
    alert('Invalid credentials (try test@example.com / password123)')
  }
}

// Handle account creation (mock)
function handleSignup() {
  if (!email.value.includes('@') || !email.value.includes('.com')) {
    alert('Email must contain @ and .com')
    return
  }
  if (password.value.length < 6) {
    alert('Password must be at least 6 characters long')
    return
  }
  // Mock signup: only allow test@example.com
  if (email.value === MOCK_EMAIL) {
    alert('Account created! You can now log in.')
    mode.value = 'login'
    email.value = ''
    password.value = ''
  }
  else {
    alert('For this mock, only test@example.com is allowed.')
  }
}

// Handle logout
function handleLogout() {
  store.logout()
  mode.value = 'login'
}

// function resetFields() {
//   email.value = ''
//   password.value = ''
// }
</script>

<template>
  <div class="form-container">
    <form v-if="!store.isLoggedIn" @submit.prevent>
      <div class="option">
        <a :class="{ active: mode === 'login' }" @click.prevent="mode = 'login'">Log In Test</a>
        <a :class="{ active: mode === 'signup' }" @click.prevent="mode = 'signup'">Create Account</a>
      </div>

      <div v-if="mode === 'login'">
        <input type="text" v-model="email" placeholder="Email" />
        <input type="password" v-model="password" placeholder="Password" />
        <button type="button" @click="handleLogin">Log In</button>
      </div>

      <div v-else>
        <input type="text" v-model="email" placeholder="Email" />
        <input type="password" v-model="password" placeholder="Password" />
        <button type="button" @click="handleSignup">Create Account</button>
      </div>
    </form>

    <div class="logout-box" v-else>
      <p>Welcome, {{ store.currentUser }}!</p>
      <button @click="handleLogout">Log Out</button>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background-color: #d7c2a2;

}

form {
  display: flex;
  flex-direction: column;
  width: 250px;
  background-color: #d7c2a2;
  padding: 0.5rem;
  border-radius: 12px;
}

.option {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 1rem;
}

a {
  font-family: Helvetica, sans-serif;
  font-weight: bold;
  font-style: italic;
  color: black;
  cursor: pointer;
  text-decoration: none;
  font-weight: bold;
}

a.active {
  text-decoration: underline;
}

input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  padding: 0.5rem 1rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #333;
}

.logout-box {
  background-color: #d7c2a2;
  padding: 1rem;
  border-radius: 8px;
  width: 250px;
  text-align: center;
}
</style>
