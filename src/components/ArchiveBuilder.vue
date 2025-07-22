<template>
  <div class="archive-builder">
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
      <div
        v-for="archive in filteredArchives"
        :key="archive.id"
        class="archive-card"
      >
        <div class="archive-card-header">
          <h3>{{ archive.name }}</h3>
          <span class="archive-date">{{ formatDate(archive.createdAt) }}</span>
        </div>

        <div class="archive-details">
          <p class="archive-description">{{ archive.description }}</p>

          <div class="archive-stats">
            <span class="stat">{{ archive.postCount }} posts</span>
            <span class="stat" v-if="archive.userFilter">{{ archive.userFilter.length }} user(s)</span>
            <span class="stat" v-if="archive.keywords">{{ archive.keywords.length }} keyword(s)</span>
          </div>

          <div class="archive-filters" v-if="hasFilters(archive)">
            <div class="filter-tags">
              <span v-if="archive.dateRange" class="filter-tag">
                {{ formatDateRange(archive.dateRange) }}
              </span>
              <span v-for="keyword in archive.keywords" :key="keyword" class="filter-tag">
                {{ keyword }}
              </span>
              <span v-for="user in archive.userFilter" :key="user" class="filter-tag">
                {{ user }}
              </span>
            </div>
          </div>
        </div>

        <div class="archive-actions">
          <button @click="viewArchive(archive)" class="btn-primary">View Archive</button>
          <button @click="downloadArchivePdf(archive)" class="btn-secondary">Download</button>
          <button @click="shareArchive(archive)" class="btn-tertiary">Share</button>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading">
      Loading archives...
    </div>

    <div v-else class="no-archives">
      <p>No archives found. Create your first archive to get started!</p>
      <button @click="createNewArchive" class="btn-create">Create Archive</button>
    </div>
  </div>
</template>

<script>
import { auth, firestore } from '@/firebaseResources.js'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import html2pdf from 'html2pdf.js'

export default {
  name: 'ArchiveBuilder',

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
    async downloadArchivePdf(archive) {
      try {
        // Create a temporary HTML element for the PDF content
        const element = document.createElement('div')
        element.innerHTML = `
          <div style="font-family: Courier, sans-serif; padding: 20px; line-height: 1.6;">
            <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">
              ${archive.name}
            </h1>

            <div style="margin: 20px 0;">
              <p><strong>Description:</strong> ${archive.description || 'No description'}</p>
              <p><strong>Created:</strong> ${this.formatDate(archive.createdAt)}</p>
              <p><strong>Total Posts:</strong> ${archive.postCount || 0}</p>
            </div>

            ${this.hasFilters(archive) ? `
              <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <h3 style="margin-top: 0;">Applied Filters:</h3>
                ${archive.dateRange ? `<p><strong>Date Range:</strong> ${this.formatDateRange(archive.dateRange)}</p>` : ''}
                ${archive.keywords && archive.keywords.length > 0 ? `<p><strong>Keywords:</strong> ${archive.keywords.join(', ')}</p>` : ''}
                ${archive.userFilter && archive.userFilter.length > 0 ? `<p><strong>Users:</strong> ${archive.userFilter.join(', ')}</p>` : ''}
              </div>
            ` : ''}

            <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
              Posts Archive
            </h2>

            ${(archive.posts || []).map(post => `
              <div style="border: 1px solid #ddd; margin: 15px 0; padding: 15px; border-radius: 5px; background-color: #fafafa;">
                <div style="margin-bottom: 10px; color: #666; font-size: 0.9em;">
                  <strong>@${post.author}</strong> • ${this.formatDate(post.timestamp)} at ${this.formatTime(post.timestamp)}
                </div>
                <div style="color: #333; line-height: 1.4;">
                  ${post.content}
                </div>
              </div>
            `).join('')}

            ${(!archive.posts || archive.posts.length === 0) ? `
              <p style="text-align: center; color: #666; font-style: italic; margin: 40px 0;">
                No posts found in this archive.
              </p>
            ` : ''}

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666; font-size: 0.8em;">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
          </div>
        `

        const options = {
          margin: 1,
          filename: `${archive.name.replace(/[^a-z0-9]/gi, '_')}_archive.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true
          },
          jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait'
          }
        }

        await html2pdf().set(options).from(element).save()
        console.log('Archive downloaded as PDF successfully')
      }
      catch (error) {
        console.error('Error downloading archive as PDF:', error)
        alert('Failed to download archive as PDF. Please try again.')
      }
    },

    // Add this helper method for time formatting
    formatTime(timestamp) {
      if (!timestamp) return 'Unknown'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString()
    },

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
      }
      catch (error) {
        console.error('Error loading archives:', error)
        this.archives = []
      }
    },

    createNewArchive() {
      this.$router.push('/archives/create')
    },

    hasFilters(archive) {
      return archive.dateRange || (archive.keywords && archive.keywords.length > 0) || (archive.userFilter && archive.userFilter.length > 0)
    },

    formatDate(timestamp) {
      if (!timestamp) return 'Unknown'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    },

    formatDateRange(dateRange) {
      if (!dateRange || !dateRange.start || !dateRange.end) {
        return 'All time'
      }
      const start = this.formatDate(dateRange.start)
      const end = this.formatDate(dateRange.end)
      return `${start} - ${end}`
    },

    viewArchive(archive) {
      this.$router.push(`/archives/${archive.id}`)
    },

    async downloadArchive(archive) {
      try {
        // Create archive data object
        const archiveData = {
          name: archive.name,
          description: archive.description,
          createdAt: this.formatDate(archive.createdAt),
          postCount: archive.postCount,
          filters: {
            dateRange: archive.dateRange,
            keywords: archive.keywords || [],
            userFilter: archive.userFilter || []
          },
          posts: archive.posts || []
        }

        // Download as JSON
        const dataStr = JSON.stringify(archiveData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)

        const link = document.createElement('a')
        link.href = url
        link.download = `${archive.name.replace(/[^a-z0-9]/gi, '_')}.json`
        link.click()

        URL.revokeObjectURL(url)
        console.log('Archive downloaded successfully')
      }
      catch (error) {
        console.error('Error downloading archive:', error)
        alert('Failed to download archive. Please try again.')
      }
    },

    async shareArchive(archive) {
      try {
        const shareUrl = `${window.location.origin}/archives/${archive.id}`

        if (navigator.share) {
          // Use native sharing if available
          await navigator.share({
            title: `Archive: ${archive.name}`,
            text: archive.description,
            url: shareUrl
          })
        }
        else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(shareUrl)
          alert('Archive link copied to clipboard!')
        }
      }
      catch (error) {
        console.error('Error sharing archive:', error)
        // Fallback: show the URL
        prompt('Copy this link to share the archive:', `${window.location.origin}/archives/${archive.id}`)
      }
    }
  }
}
</script>

<style scoped>
.archive-builder {
  max-width: 1200px;
  margin: 0 auto;
}

.archive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.archive-header h1 {
  font-family: Helvetica, sans-serif;
  font-weight: bold;
  font-style: italic;
  color: black;
  margin: 0;
}

.btn-create {
  background-color: #d7c2a2;
  color: black;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: Helvetica, sans-serif;
  font-weight: bold;
  font-style: italic;
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

.archive-card {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: box-shadow 0.2s;
}

.archive-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.archive-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.archive-card-header h3 {
  margin: 0;
  color: #333;
  font-family: Courier, sans-serif;
}

.archive-date {
  color: #666;
  font-size: 0.9rem;
  font-family: Courier, sans-serif;
}

.archive-description {
  color: #555;
  margin-bottom: 1rem;
  font-family: Courier, sans-serif;
}

.archive-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  background-color: #e0e0e0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: Courier, sans-serif;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-tag {
  background-color: #d7c2a2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: Courier, sans-serif;
}

.archive-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary, .btn-secondary, .btn-tertiary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: Courier, sans-serif;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #333;
  color: white;
}

.btn-secondary {
  background-color: #d7c2a2;
  color: black;
}

.btn-tertiary {
  background-color: transparent;
  color: #333;
  border: 1px solid #333;
}

.btn-primary:hover, .btn-secondary:hover, .btn-tertiary:hover {
  opacity: 0.8;
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
