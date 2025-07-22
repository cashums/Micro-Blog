<template>
  <main class="archive-view">
    <div class="archive-header">
      <h1>My Archives</h1>
      <button @click="createNewArchive" class="btn-create">+ Create New Archive</button>
    </div>

    <div class="archive-controls">
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search archives..."
          class="search-input"
        />
      </div>

      <div class="filter-controls">
        <select v-model="sortBy" class="sort-select">
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
        </select>
      </div>
    </div>

    <div class="archives-grid" v-if="filteredArchives.length > 0">
      <ArchiveCard
        v-for="archive in filteredArchives"
        :key="archive.id"
        :archive="archive"
        @download="downloadArchive"
        @share="shareArchive"
      />
    </div>

    <div v-else-if="loading" class="loading">
      Loading archives...
    </div>

    <div v-else class="no-archives">
      <p>No archives found. Create your first archive to get started!</p>
      <button @click="createNewArchive" class="btn-create">Create Archive</button>
    </div>
  </main>
</template>

<script>
import { auth, firestore } from '@/firebaseResources.js'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import ArchiveCard from '@/components/ArchiveCard.vue'

export default {
  name: 'ArchiveView',

  components: {
    ArchiveCard
  },

  data() {
    return {
      currentUser: null,
      archives: [],
      loading: true,
      searchQuery: '',
      sortBy: 'date'
    }
  },

  computed: {
    filteredArchives() {
      let filtered = this.archives

      // Search filter
      if (this.searchQuery) {
        filtered = filtered.filter(archive =>
          archive.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          archive.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }

      // Sort
      return filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'size':
            return b.postCount - a.postCount
          case 'date':
          default:
            return b.createdAt.toDate() - a.createdAt.toDate()
        }
      })
    }
  },

  mounted() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user
      if (user) {
        await this.loadArchives()
      }
      this.loading = false
    })
  },

  methods: {
    async loadArchives() {
      try {
        const archivesQuery = query(
          collection(firestore, "archives"),
          where("createdBy", "==", this.currentUser.uid),
          orderBy("createdAt", "desc")
        )

        const querySnapshot = await getDocs(archivesQuery)
        this.archives = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error loading archives:', error)
        this.archives = []
      }
    },

    createNewArchive() {
      this.$router.push('/archives/create')
    },

    downloadArchive(archive) {
      // TODO: Implement archive download
      console.log('Downloading archive:', archive.name)
    },

    shareArchive(archive) {
      // TODO: Implement archive sharing
      console.log('Sharing archive:', archive.name)
    }
  }
}
</script>

<style scoped>
.archive-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.archive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.archive-header h1 {
  font-family: Courier, sans-serif;
  color: #333;
  margin: 0;
}

.btn-create {
  background-color: #333;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: Courier, sans-serif;
}

.btn-create:hover {
  background-color: #555;
}

.archive-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
  font-family: Courier, sans-serif;
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: Courier, sans-serif;
}

.archives-grid {
  display: grid;
  gap: 1rem;
}

.loading, .no-archives {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-family: Courier, sans-serif;
}

.no-archives p {
  margin-bottom: 1rem;
}
</style>
