<template>
  <div class="form-container">
    <form v-if="!currentUser" @submit.prevent>
      <div class="option">
        <a :class="{ active: mode === 'login' }" @click.prevent="mode = 'login'">Log In</a>
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
      <p>Welcome, {{ currentUser?.email }}!</p>
      <button @click="handleLogout">Log Out</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth } from '@/firebaseResources.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const mode = ref('login')
const email = ref('')
const password = ref('')
const currentUser = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    if (user) {
      console.log('User is signed in:', user.email)
    }
    else {
      console.log('User is signed out')
    }
  })
})

function handleLogin() {
  if (email.value.trim() === '' || password.value.trim() === '') {
    alert('Please enter email and password.')
    return
  }

  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      console.log('Successfully logged in!')
      email.value = ''
      password.value = ''
      router.push('/')
    })
    .catch((error) => {
      console.log(error.code)
      alert(error.message)
    })
}

function handleSignup() {
  // https://www.youtube.com/watch?v=G8BRVETdLVY - How to Validate a Password Using JavaScript (Simple)
  if (password.value.length > 16) {
    password.value = "";
    return alert("Password must be 16 characters or less.");
  }
  if (password.value.length < 8) {
    password.value = "";
    return alert("Password must be 8 characters or longer.");
  }
  if (!/[a-z]/.test(password.value) && !/[A-Z]]/.test(password.value)) {
    password.value = "";
    return alert("Password must contain at least one letter.");
  }
  if (!/[0-9]/.test(password.value)) {
    password.value = "";
    return alert("Password must contain at least one number.");
  }
  if (!/[^a-zA-Z0-9]/.test(password.value)) {
    password.value = "";
    return alert("Password must contain at least one special non-alphanumeric character.");
  }

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      console.log('Successfully registered!')
      email.value = ''
      password.value = ''
      mode.value = 'login'
      router.push('/')
    })
    .catch((error) => {
      console.log(error.code)
      alert(error.message)
    })
}

function handleLogout() {
  signOut(auth)
    .then(() => {
      router.push('/login')
    })
    .catch((error) => {
      console.log(error.code)
      alert(error.message)
    })
}
</script>

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
