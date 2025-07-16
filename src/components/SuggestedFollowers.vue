<template>
  <div class="suggested-followers">
    <p class="title">Users to Follow</p>
    <div v-if="userCount < 1">No one to follow right now.</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id" class="user-entry">
        <RouterLink :to="`/users/${user.id}`">{{ user.email }}</RouterLink>
        <button v-if="currentUser" @click="follow(user)">Follow</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { auth, firestore } from '@/firebaseResources.js'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, getDocs, collection, query, updateDoc, arrayUnion, getCountFromServer } from 'firebase/firestore'

export default {
  name: "SuggestedFollowers",

  props: {
    userId: {
      type: String,
      required: false
    }
  },

  data() {
    return {
      currentUser: null,
      users: [],
      userCount: 0
    }
  },

  async mounted() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user
      this.loadUsers()
      this.getUserCount()
    })
  },

  methods: {
    async follow(targetUser) {
      if (!this.currentUser) return

      try {
        const currentUserId = this.currentUser.uid
        const targetUserId = targetUser.id

        const targetUserDoc = await getDoc(doc(firestore, "users", targetUserId))
        const targetUserPosts = targetUserDoc.data().posts || []

        await updateDoc(doc(firestore, "users", currentUserId), {
          following: arrayUnion(targetUserId),
          feed: arrayUnion(...targetUserPosts)
        })

        await updateDoc(doc(firestore, "users", targetUserId), {
          followers: arrayUnion(currentUserId)
        })

        console.log(`Successfully followed ${targetUser.email}`)
        this.loadUsers() // Refresh the users list
      }
      catch (error) {
        console.error("Error following user:", error)
        alert("Failed to follow user. Please try again.")
      }
    },

    async loadUsers() {
      try {
        if (this.userId) {
          const userDoc = await getDoc(doc(firestore, "users", this.userId))
          if (userDoc.exists() && userDoc.id !== this.currentUser?.uid) {
            this.users = [{
              id: userDoc.id,
              ...userDoc.data()
            }]
          } else {
            this.users = []
          }
        }
        else {
          // Load all users except current user
          const usersRef = collection(firestore, "users")
          const querySnapshot = await getDocs(query(usersRef))
          this.users = querySnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(user => user.id !== this.currentUser?.uid)
        }
      } catch (error) {
        console.error("Error loading users:", error)
        this.users = []
      }
    },

    async getUserCount() {
      try {
        const snapshot = await getCountFromServer(collection(firestore, "users"))
        this.userCount = snapshot.data().count
      }
      catch (error) {
        alert("Error getting user count:", error)
        this.userCount = 0
      }
    }
  }
}

// const store = posts()

// const props = defineProps({
//   userId: Number
// })

// const users = computed(() => {
//   if (props.userId) {
//     const viewedUser = typeof store.getUserById === 'function'
//       ? store.getUserById(props.userId) : null
//     if (!viewedUser || viewedUser.username === store.currentUser) return []
//     return [viewedUser]
//   }

//   return store.users.filter(u => u.id !== store.currentUser?.id)
// })

// const isLoggedIn = computed(() => store.isLoggedIn)

// function follow(user) {
//   alert(`Followed ${user.username}`)
//   user.incrementFollowersCount()
// }

// console.log('props.userId:', props.userId)
// console.log('viewedUser:', store.getUserById(props.userId))
// console.log('currentUser:', store.currentUser)
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
