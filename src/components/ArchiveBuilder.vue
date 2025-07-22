<template>
  <div class="archive-builder">
    <div class="archive-header">
      <h1>My Archives</h1>
      <div class="header-buttons">
        <button @click="testPDF" class="btn-test">🧪 Test PDF</button>
        <button @click="createNewArchive" class="btn-create">+ Create New Archive</button>
      </div>
    </div>

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
          <button @click="downloadArchivePdf($event, archive)" class="btn-secondary">Download</button>
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
    // Add this test method
    async testPDF() {
      try {
        // Create a simple test HTML element
        const testElement = document.createElement('div')
        testElement.innerHTML = `
          <div style="font-family: Courier, sans-serif; padding: 20px; color: #333;">
            <h1 style="color: black; text-align: center; border-bottom: 2px solid #007acc; padding-bottom: 10px;">
              🧪 PDF Test Document
            </h1>

            <div style="margin: 20px 0; padding: 15px; background: #f0f7ff; border-radius: 8px;">
              <h2 style="color: black; margin-top: 0;">Test Information</h2>
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p><strong>User:</strong> ${this.currentUser?.email || 'Not logged in'}</p>
              <p><strong>Browser:</strong> ${navigator.userAgent.split(' ')[0]}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Sample Content</h3>
              <p style="line-height: 1.6;">This is a test PDF generated using html2pdf.js. The library converts HTML and CSS into a downloadable PDF file.</p>

              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 0;"><strong>✅ Success!</strong> If you're reading this, html2pdf is working correctly.</p>
              </div>

              <ul style="line-height: 1.8;">
                <li>HTML content ✓</li>
                <li>CSS styling ✓</li>
                <li>Colors and backgrounds ✓</li>
                <li>Typography ✓</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; color: #666;">
              <p>Generated by CapsLock Archive System</p>
            </div>
          </div>
        `

        // Simple PDF options
        const options = {
          margin: 1,
          filename: `PDF_Test_${new Date().getTime()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }

        // Generate and download
        console.log('Starting PDF test...')
        await html2pdf().set(options).from(testElement).save()
        console.log('✅ PDF test completed successfully!')
      }
      catch (error) {
        console.error('❌ PDF test failed:', error)
        alert(`PDF test failed: ${error.message}`)
      }
    },

    async downloadArchivePdf(event, archive) {
    try {
      // Create a temporary HTML element for the PDF content
      const element = document.createElement('div')
      element.innerHTML = `
        <div style="font-family: Courier, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 20px;">
            <h1 style="margin: 0; font-size: 2em; color: #333;">${archive.name}</h1>
            <p style="margin: 10px 0 0 0; color: #666; font-style: italic;">Digital Archive Export</p>
          </div>

          <div style="margin: 30px 0; display: flex; justify-content: space-between; background: #f8f8f8; padding: 15px; border-radius: 8px;">
            <div>
              <p style="margin: 5px 0;"><strong>Created:</strong> ${this.formatDate(archive.createdAt)}</p>
              <p style="margin: 5px 0;"><strong>Total Posts:</strong> ${archive.postCount || 0}</p>
            </div>
            <div>
              <p style="margin: 5px 0;"><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          ${archive.description ? `
            <div style="margin: 20px 0; padding: 15px; background: #f0f7ff; border-left: 4px solid #007acc; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #007acc;">Description</h3>
              <p style="margin: 0; line-height: 1.5;">${archive.description}</p>
            </div>
          ` : ''}

          ${this.hasFilters(archive) ? `
            <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
              <h3 style="margin: 0 0 10px 0; color: #856404;">Applied Filters</h3>
              ${archive.dateRange ? `<p style="margin: 5px 0;"><strong>📅 Date Range:</strong> ${this.formatDateRange(archive.dateRange)}</p>` : ''}
              ${archive.keywords && archive.keywords.length > 0 ? `<p style="margin: 5px 0;"><strong>🔍 Keywords:</strong> ${archive.keywords.join(', ')}</p>` : ''}
              ${archive.userFilter && archive.userFilter.length > 0 ? `<p style="margin: 5px 0;"><strong>👤 Users:</strong> ${archive.userFilter.join(', ')}</p>` : ''}
            </div>
          ` : ''}

          <div style="margin: 30px 0;">
            <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
              📝 Archived Posts (${(archive.posts || []).length})
            </h2>

            ${(archive.posts || []).map((post) => `
              <div style="border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px; background: #fafafa; page-break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                  <div style="font-weight: bold; color: #007acc;">@${post.author}</div>
                  <div style="color: #666; font-size: 0.9em;">${this.formatDate(post.timestamp)} • ${this.formatTime(post.timestamp)}</div>
                </div>
                <div style="color: #333; line-height: 1.6; font-size: 1.1em;">
                  ${post.content}
                </div>
              </div>
            `).join('')}

            ${(!archive.posts || archive.posts.length === 0) ? `
              <div style="text-align: center; padding: 40px; color: #666; font-style: italic; background: #f8f8f8; border-radius: 8px;">
                <p style="margin: 0; font-size: 1.1em;">📭 No posts found in this archive</p>
              </div>
            ` : ''}
          </div>

          <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #333; text-align: center; color: #666; font-size: 0.9em;">
            <p style="margin: 0;">This archive was generated from the CapsLock social platform</p>
            <p style="margin: 5px 0 0 0;">Preserved for posterity • ${new Date().getFullYear()}</p>
          </div>
        </div>
      `

      const options = {
        margin: [0.7, 0.7, 0.7, 0.7],  // top, left, bottom, right margins
        filename: `${archive.name.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_')}_archive.pdf`,
        image: {
          type: 'jpeg',
          quality: 0.95
        },
        html2canvas: {
          scale: 2,                    // High resolution
          useCORS: true,              // Cross-origin images
          letterRendering: true,       // Better text
          backgroundColor: '#ffffff'   // White background
        },
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['avoid-all', 'css'],  // Avoid breaking elements
          before: '.page-break-before',
          after: '.page-break-after'
        }
      }

      // Show loading indicator
      const originalText = event.target.textContent
      event.target.textContent = 'Generating PDF...'
      event.target.disabled = true

      await html2pdf().set(options).from(element).save()

      // Reset button
      event.target.textContent = originalText
      event.target.disabled = false

      console.log('Archive downloaded as PDF successfully')
    }
    catch (error) {
      console.error('Error downloading archive as PDF:', error)
      alert('Failed to download archive as PDF. Please try again.')

      // Reset button on error
      if (event && event.target) {
        event.target.textContent = 'Download'
        event.target.disabled = false
      }
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
.header-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-test {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: Courier, sans-serif;
  font-size: 0.9rem;
}

.btn-test:hover {
  background-color: #218838;
}

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
