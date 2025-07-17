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
      <div class="placeholder-text">Welcome, {{ currentUser?.email }}!</div>
      <br>
      <button @click="handleLogout">Log Out</button>
    </div>
  </div>
</template>

<script>
import { auth, firestore } from '@/firebaseResources.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export default {
  name: "LoginBox",

  data() {
    return {
      mode: "login",
      email: "",
      password: "",
      currentUser: null
    }
  },

  mounted() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user
      if (user) {
        console.log('User is signed in:', user.email)
      }
      else {
        console.log('User is signed out')
      }
    })
  },

  methods: {
    async handleLogin() {
      if (this.email.trim() === '' || this.password.trim() === '') {
        alert('Please enter email and password.')
        return
      }

      try {
        await signInWithEmailAndPassword(auth, this.email, this.password)
        console.log('Successfully logged in!')
        this.email = ''
        this.password = ''
        this.$router.push('/')
      }
      catch (error) {
        console.log(error.code)
        alert(error.message)
      }
    },

    async handleSignup() {
      // https://www.youtube.com/watch?v=G8BRVETdLVY - How to Validate a Password Using JavaScript (Simple)
      if (this.password.length > 16) {
        this.password = ""
        return alert("Password must be 16 characters or less.")
      }
      if (this.password.length < 8) {
        this.password = ""
        return alert("Password must be 8 characters or longer.")
      }
      if (!/[a-z]/.test(this.password) && !/[A-Z]/.test(this.password)) {
        this.password = ""
        return alert("Password must contain at least one letter.")
      }
      if (!/[0-9]/.test(this.password)) {
        this.password = ""
        return alert("Password must contain at least one number.")
      }
      if (!/[^a-zA-Z0-9]/.test(this.password)) {
        this.password = ""
        return alert("Password must contain at least one special character.")
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password)
        const user = userCredential.user

        await setDoc(doc(firestore, "users", user.uid), {
          email: user.email,
          feed: [],
          followers: [],
          following: [],
          posts: []
        })

        console.log('Successfully registered and created user document!')
        this.email = ''
        this.password = ''
        this.mode = 'login'
        this.$router.push('/')
      }
      catch (error) {
        console.log(error.code)
        alert(error.message)
      }
    },

    async handleLogout() {
      try {
        await signOut(auth)
        this.$router.push('/login')
      }
      catch (error) {
        console.log(error.code)
        alert(error.message)
      }
    }
  }
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
