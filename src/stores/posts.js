import { defineStore } from 'pinia'

export const posts = defineStore('app', {
  state: () => ({
    users: [
      {
        id: 1,
        username: 'capslover@gmail.com',
        postsCount: 3,
        followingCount: 10,
        followersCount: 5,
      },
      {
        id: 2,
        username: 'typefan@gmail.com',
        postsCount: 3,
        followingCount: 5,
        followersCount: 8,
      },
      {
        id: 3,
        username: 'switchmaster@gmail.com',
        postsCount: 2,
        followingCount: 7,
        followersCount: 12,
      },
      {
        id: 4,
        username: 'keysetqueen@gmail.com',
        postsCount: 2,
        followingCount: 15,
        followersCount: 20,
      },
      {
        id: 5,
        username: 'test@example.com',
        postsCount: 1,
        followingCount: 3,
        followersCount: 4,
      },
    ],
    posts: [
      {
        id: 1,
        username: 'capslover@gmail.com',
        userId: 1,
        date: '2025-07-11',
        time: '06:03:32',
        content: 'Just finished building my dream keyboard with holy pandas!',
      },
      {
        id: 2,
        username: 'typefan@gmail.com',
        userId: 2,
        date: '2025-07-10',
        time: '07:18:58',
        content: 'Finally lubed all my switches. Feels so smooth!',
      },
      {
        id: 3,
        username: 'capslover@gmail.com',
        userId: 1,
        date: '2025-07-09',
        time: '12:00:00',
        content: 'Swapped in some new keycaps today. Loving the new look!',
      },
      {
        id: 4,
        username: 'switchmaster@gmail.com',
        userId: 3,
        date: '2025-07-08',
        time: '15:20:00',
        content: 'Tried a new spring swap mod today. Game changer!',
      },
      {
        id: 5,
        username: 'keysetqueen@gmail.com',
        userId: 4,
        date: '2025-07-07',
        time: '10:45:00',
        content: 'Designed a new artisan keycap set. Pre-orders open soon!',
      },
      {
        id: 6,
        username: 'typefan@gmail.com',
        userId: 2,
        date: '2025-07-06',
        time: '09:30:00',
        content: 'Exploring different plate materials this week.',
      },
      {
        id: 7,
        username: 'test@example.com',
        userId: 5,
        date: '2025-07-05',
        time: '14:15:00',
        content: 'Built a macro pad with OLED screen. Super fun project!',
      },
      {
        id: 8,
        username: 'keysetqueen@gmail.com',
        userId: 4,
        date: '2025-07-04',
        time: '11:00:00',
        content: 'Working on new desk mat designs to match my keysets.',
      },
      {
        id: 9,
        username: 'switchmaster@gmail.com',
        userId: 3,
        date: '2025-07-03',
        time: '17:00:00',
        content: 'Added foam mod to my board. Feels and sounds amazing!',
      },
      {
        id: 10,
        username: 'typefan@gmail.com',
        userId: 2,
        date: '2025-07-02',
        time: '08:00:00',
        content: 'Finally finished my keycap collection display wall!',
      },
    ],
    isLoggedIn: false,
    currentUser: '',
  }),

  actions: {
    toggleMode(modeInput) {
      this.mode = modeInput
    },
    login(username) {
      this.currentUser = username
      this.isLoggedIn = true
    },
    logout() {
      this.currentUser = ''
      this.isLoggedIn = false
    },

    incrementFollowing() {
      this.following += 1
    },
    incrementFollowers() {
      this.followers += 1
    },
  },

  getters: {
    getPostsByUser: (state) => (userId) => {
      return state.posts.filter((post) => post.userId === userId)
    },
    getUserById: (state) => (id) => {
      return state.users.find((user) => user.id === id)
    },
    isLogin: (state) => state.mode === 'login',
    isViewingAnotherUser: (state) => state.viewingUser !== '',
  },
})
