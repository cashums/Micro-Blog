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
        <div v-if="loadingPosts" class="loading-state">Loading posts...</div>
        <ul v-else>
          <li v-for="post in archivePosts" :key="post.id">
            <div class="post-header">
              <strong>{{ post.authorEmail || "Unknown User" }}</strong>
              <span class="post-time">{{ formatTime(post.timestamp) }}</span>
            </div>
            <p class="post-content">{{ post.content || "No content available" }}</p>
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
      archivePosts: [],
      loading: true,
      loadingPosts: false,
    };
  },
  async mounted() {
    await this.loadArchive();
    await this.loadArchivePosts();
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

    async loadArchivePosts() {
      if (!this.archive || !this.archive.posts || this.archive.posts.length === 0) {
        return;
      }

      this.loadingPosts = true;

      try {
        // Fetch posts by their IDs
        const postPromises = this.archive.posts.map(async (postId) => {
          const postDoc = await getDoc(doc(firestore, "posts", postId));
          if (postDoc.exists()) {
            const postData = postDoc.data();
            // Get user email for the post author
            let authorEmail = "Unknown User";
            try {
              const userDoc = await getDoc(doc(firestore, "users", postData.author));
              if (userDoc.exists()) {
                authorEmail = userDoc.data().email;
              }
            }
            catch (error) {
              console.error("Error fetching user data:", error);
            }

            return {
              id: postDoc.id,
              ...postData,
              authorEmail,
            };
          }
          return null;
        });

        const posts = await Promise.all(postPromises);
        this.archivePosts = posts.filter(post => post !== null);

        // Sort posts by timestamp (newest first)
        this.archivePosts.sort((a, b) => {
          const timestampA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const timestampB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return timestampB - timestampA;
        });
      }
      catch (error) {
        console.error("Error fetching archive posts:", error);
        alert("Failed to load archive posts.");
      }
      finally {
        this.loadingPosts = false;
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

    formatTime(timestamp) {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.archive {
  width: 75vw;
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
  font-family: Helvetica, sans-serif;
  font-weight: bold;
  font-style: italic;
  color: black;
  margin-bottom: 1rem;
}

p {
  font-size: 1rem;
  color: black;
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
