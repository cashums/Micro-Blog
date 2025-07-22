<template>
  <div class="archive-card">
    <div class="archive-header">
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

      <div class="archive-filters" v-if="hasFilters">
        <div class="filter-tags">
          <span v-if="archive.dateRange" class="filter-tag">
            📅 {{ formatDateRange(archive.dateRange) }}
          </span>
          <span v-for="keyword in archive.keywords" :key="keyword" class="filter-tag">
            🔍 {{ keyword }}
          </span>
          <span v-for="user in archive.userFilter" :key="user" class="filter-tag">
            👤 {{ user }}
          </span>
        </div>
      </div>
    </div>

    <div class="archive-actions">
      <button @click="viewArchive" class="btn-primary">View Archive</button>
      <button @click="downloadArchive" class="btn-secondary">Download</button>
      <button @click="shareArchive" class="btn-tertiary">Share</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArchiveCard',

  props: {
    archive: {
      type: Object,
      required: true
    }
  },

  computed: {
    hasFilters() {
      return this.archive.dateRange ||
             (this.archive.keywords && this.archive.keywords.length > 0) ||
             (this.archive.userFilter && this.archive.userFilter.length > 0)
    }
  },

  methods: {
    formatDate(timestamp) {
      if (!timestamp) return 'Unknown'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    },

    formatDateRange(dateRange) {
      if (!dateRange || !dateRange.start || !dateRange.end) return 'All time'
      const start = this.formatDate(dateRange.start)
      const end = this.formatDate(dateRange.end)
      return `${start} - ${end}`
    },

    viewArchive() {
      this.$router.push(`/archives/${this.archive.id}`)
    },

    downloadArchive() {
      this.$emit('download', this.archive)
    },

    shareArchive() {
      this.$emit('share', this.archive)
    }
  }
}
</script>

<style scoped>
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

.archive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.archive-header h3 {
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
</style>
