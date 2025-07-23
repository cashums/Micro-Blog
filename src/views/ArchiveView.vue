<template>
  <div class="archive-view">
    <h1>📚 Archive Details</h1>
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
  name: "ArchiveView",
  data() {
    return {
      archive: null,
      loading: true
    };
  },

  async mounted() {
    const archiveId = this.$route.params.id; // Get archive ID from route params
    try {
      const archiveDoc = await getDoc(doc(firestore, "archives", archiveId));
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

  methods: {
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
  }
};
</script>

<style scoped>
.archive-view {
  max-width: 1200px; /* Center the content */
  margin: 0 auto; /* Center horizontally */
  margin-top: 100px; /* Add spacing from the top */
  padding: 2rem;
  font-family: Courier, sans-serif; /* Match font style */
  background-color: #f8f9fa; /* Light background for contrast */
  border: 1px solid #ddd; /* Add border for separation */
  border-radius: 8px; /* Rounded corners for a modern look */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

.loading-state {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
}

h1 {
  font-size: 2rem; /* Larger font for the main heading */
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.5rem; /* Subheading font size */
  font-weight: bold;
  color: #007acc; /* Blue color for emphasis */
  margin-bottom: 1rem;
}

p {
  font-size: 1rem; /* Standard paragraph font size */
  color: #333;
  margin-bottom: 1rem;
}

.posts {
  margin-top: 2rem;
}

.posts h3 {
  font-size: 1.3rem; /* Font size for posts section heading */
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
}

.posts ul {
  list-style-type: disc;
  padding-left: 2rem;
}

.posts li {
  font-size: 1rem; /* Font size for individual posts */
  color: #333;
  margin-bottom: 0.5rem;
  background: white; /* White background for individual posts */
  border: 1px solid #ddd; /* Light border for separation */
  border-radius: 6px; /* Rounded corners for a modern look */
  padding: 0.75rem; /* Add padding for spacing */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}
</style>
