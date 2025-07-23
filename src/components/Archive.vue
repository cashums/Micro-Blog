<template>
  <div class="archive">
    <div v-if="loading" class="loading-state">Loading archive details...</div>
    <div v-else>
      <h2>{{ archive.name || "Unnamed Archive" }}</h2>
      <p><strong>Description:</strong> {{ archive.description || "No description provided." }}</p>
      <p><strong>Created By:</strong> {{ archive.creatorEmail || "Unknown" }}</p>
      <p><strong>Created On:</strong> {{ archive.createdAt ? formatDate(archive.createdAt) : "Invalid Date" }}</p>
      <p><strong>Post Count:</strong> {{ archive.postCount || 0 }}</p>
      <div class="posts">
        <h3>Posts in this Archive:</h3>
        <ul>
          <li v-for="post in archive.posts" :key="post.id">
            {{ post.content || "No content available" }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebaseResources.js";

export default {
  name: "ArchiveItem",
  props: {
    archiveId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      archive: null,
      loading: true,
    };
  },
  async mounted() {
    await this.loadArchive();
  },
  methods: {
    async loadArchive() {
      try {
        const archiveDoc = await getDoc(doc(firestore, "archives", this.archiveId));
        if (archiveDoc.exists()) {
          const archiveData = archiveDoc.data();

          // Ensure createdAt is properly converted to a Date object
          archiveData.createdAt = archiveData.createdAt?.toDate
            ? archiveData.createdAt.toDate()
            : new Date(archiveData.createdAt);

          this.archive = archiveData;
        }
        else {
          alert("Archive not found.");
        }
      }
      catch (error) {
        console.error("Error fetching archive:", error);
        alert("Failed to load archive details.");
      }
      finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      if (!date || isNaN(new Date(date).getTime())) {
        return "Invalid Date";
      }
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
};
</script>

<style scoped>
.archive {
  padding: 2rem;
  font-family: Courier, sans-serif;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-state {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
}

h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007acc;
  margin-bottom: 1rem;
}

p {
  font-size: 1rem;
  color: #333;
  margin-bottom: 1rem;
}

.posts {
  margin-top: 2rem;
}

.posts h3 {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
}

.posts ul {
  list-style-type: disc;
  padding-left: 2rem;
}

.posts li {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.75rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
</style>
