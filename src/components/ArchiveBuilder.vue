<template>
  <div class="archive-builder">
    <div class="archive-header">
      <h1>My Archives</h1>
      <button @click="toggleCreateArchive" class="btn-create">
        {{ creatingArchive ? "Close Archive Creator" : "+ Create New Archive" }}
      </button>
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
        </select>
      </div>
    </div>

    <div class="archives-container">
      <div class="archives-grid" v-if="filteredArchives.length > 0">
        <div
          v-for="archive in filteredArchives"
          :key="archive.id"
          class="archive-card"
        >
          <div class="archive-card-header">
            <h3>{{ archive.name }}</h3>
            <span class="archive-date">{{
              formatDate(archive.createdAt)
            }}</span>
          </div>

          <div class="archive-details">
            <p class="archive-description">
              {{ archive.description }}, {{ archive.creatorEmail }}
            </p>
            <p class="archive-description">
              <strong>Created By:</strong> {{ archive.creatorEmail }}
            </p>

            <div class="archive-stats">
              <span class="stat">{{ archive.postCount }} posts</span>
              <span class="stat" v-if="archive.userFilter"
                >{{ archive.userFilter.length }} user(s)</span
              >
              <span class="stat" v-if="archive.keywords"
                >{{ archive.keywords.length }} keyword(s)</span
              >
            </div>

            <div class="archive-filters" v-if="hasFilters(archive)">
              <div class="filter-tags">
                <span v-if="archive.dateRange" class="filter-tag">
                  {{ formatDateRange(archive.dateRange) }}
                </span>
                <span
                  v-for="keyword in archive.keywords"
                  :key="keyword"
                  class="filter-tag"
                >
                  {{ keyword }}
                </span>
                <span
                  v-for="user in archive.userFilter"
                  :key="user"
                  class="filter-tag"
                >
                  {{ user }}
                </span>
              </div>
            </div>
          </div>

          <div class="archive-actions">
            <button @click="viewArchive(archive.id)" class="btn-primary">
              View Archive
            </button>
            <button
              @click="downloadArchivePdf($event, archive)"
              class="btn-secondary"
            >
              Download
            </button>
            <button @click="shareArchive(archive)" class="btn-tertiary">
              Share
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="loading">Loading archives...</div>

      <div v-else class="no-archives">
        <p>No archives found. Create your first archive to get started!</p>
      </div>

      <div v-if="creatingArchive" class="archive-creator">
        <h2>Create New Archive</h2>
        <div class="form-group">
          <label>Archive Name:</label>
          <textarea
            type="text"
            v-model="newArchive.name"
            placeholder="Enter archive name..."
            class="form-textarea"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Description:</label>
          <textarea
            v-model="newArchive.description"
            placeholder="Describe this archive..."
            class="form-textarea"
          ></textarea>
        </div>
        <div class="form-group">
          <h3>Filters</h3>
          <div class="filter-group">
            <label>
              <input type="checkbox" v-model="filters.dateRange.enabled" />
              Date Range
            </label>
            <div v-if="filters.dateRange.enabled" class="date-inputs">
              <input type="date" v-model="filters.dateRange.start" />
              <span>to</span>
              <input type="date" v-model="filters.dateRange.end" />
            </div>
          </div>

          <div class="filter-group">
            <label>
              <input type="checkbox" v-model="filters.users.enabled" />
              Specific Users
            </label>
            <div v-if="filters.users.enabled" class="user-filter">
              <input
                type="text"
                v-model="filters.users.input"
                @keyup.enter="addUser"
                placeholder="Enter email and press Enter..."
                class="form-input"
              />
              <div class="selected-users">
                <span
                  v-for="user in filters.users.selected"
                  :key="user"
                  class="user-tag"
                >
                  {{ user }}
                  <button @click="removeUser(user)" class="remove-btn">
                    ×
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div class="filter-group">
            <label>
              <input type="checkbox" v-model="filters.keywords.enabled" />
              Keywords
            </label>
            <div v-if="filters.keywords.enabled" class="keyword-filter">
              <input
                type="text"
                v-model="filters.keywords.input"
                @keyup.enter="addKeyword"
                placeholder="Enter keyword and press Enter..."
                class="form-input"
              />
              <div class="selected-keywords">
                <span
                  v-for="keyword in filters.keywords.selected"
                  :key="keyword"
                  class="keyword-tag"
                >
                  {{ keyword }}
                  <button @click="removeKeyword(keyword)" class="remove-btn">
                    ×
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <button
          @click="createArchive"
          class="btn-generate"
          :disabled="!canGenerate"
        >
          Generate Archive
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, firestore } from "@/firebaseResources.js";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  limit
} from "firebase/firestore";
import html2pdf from "html2pdf.js";

export default {
  name: "ArchiveBuilder",

  data() {
    return {
      currentUser: null,
      archives: [],
      loading: true,
      searchQuery: "",
      sortBy: "date",
      creatingArchive: false,
      newArchive: {
        name: "",
        description: ""
      },
      filters: {
        dateRange: { enabled: false, start: "", end: "" },
        users: { enabled: false, input: "", selected: [] },
        keywords: { enabled: false, input: "", selected: [] }
      }
    };
  },

  computed: {
    canGenerate() {
      return (
        this.newArchive.name.trim().length > 0 && this.activeFiltersCount > 0
      );
    },

    activeFiltersCount() {
      let count = 0;
      if (this.filters.dateRange.enabled) count++;
      if (
        this.filters.users.enabled &&
          this.filters.users.selected.length > 0
      )
        count++;
      if (
        this.filters.keywords.enabled &&
          this.filters.keywords.selected.length > 0
      )
        count++;
      return count;
    },

    filteredArchives() {
      let filtered = this.archives;

      if (this.searchQuery) {
        filtered = filtered.filter(
          (archive) =>
            archive.name
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()) ||
              archive.description
                .toLowerCase()
                .includes(this.searchQuery.toLowerCase()) ||
              archive.creatorEmail
                .toLowerCase()
                .includes(this.searchQuery.toLowerCase()) ||
              archive.creatorID
                .toLowerCase()
                .includes(this.searchQuery.toLowerCase())
        );
      }

      return filtered.sort((a, b) => {
        switch (this.sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.postCount - a.postCount;
        case "date":
        default: {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt);
          return dateB - dateA;
        }
        }
      });
    }
  },

  mounted() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      this.loading = true;

      if (user) {
        await this.loadArchives();
      }
      this.loading = false;
    });
  },

  methods: {
    toggleCreateArchive() {
      this.creatingArchive = !this.creatingArchive;
      if (!this.creatingArchive) {
        this.resetForm();
      }
    },

    viewArchive(archiveId) {
      if (!archiveId) {
        alert("Archive ID is missing.");
        return;
      }

      this.$router.push({ name: "archive", params: { id: archiveId } });
    },

    async createArchive() {
      if (!this.currentUser) {
        alert("You must be logged in to create an archive.");
        return;
      }

      if (!this.newArchive.name.trim()) {
        alert("Archive name cannot be empty.");
        return;
      }

      try {
        const posts = await this.fetchFilteredPosts();

        const archiveData = {
          name: this.newArchive.name,
          description: this.newArchive.description || "",
          creatorID: this.currentUser.uid,
          creatorEmail: this.currentUser.email,
          createdAt: new Date(),
          postCount: posts.length,
          dateRange: this.filters.dateRange.enabled
            ? {
              start: this.filters.dateRange.start,
              end: this.filters.dateRange.end
            }
            : null,
          userFilter: this.filters.users.enabled
            ? this.filters.users.selected
            : null,
          keywords: this.filters.keywords.enabled
            ? this.filters.keywords.selected
            : null,
          posts: posts.map((post) => post.id)
        };

        const archiveRef = await addDoc(
          collection(firestore, "archives"),
          archiveData
        );
        console.log("Archive created successfully with ID:", archiveRef.id);

        this.creatingArchive = false;
        this.resetForm();
        await this.loadArchives();

        alert(
          `Archive "${this.newArchive.name}" created successfully with ${posts.length} posts!`
        );
      }
      catch (error) {
        console.error("Error creating archive:", error);
        alert("Failed to create archive. Please try again.");
      }
    },

    async fetchArchives() {
      const archivesSnapshot = await getDocs(
        collection(firestore, "archives")
      );
      this.archives = archivesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    },

    async fetchFilteredPosts() {
      try {
        let postsQuery = query(collection(firestore, "posts"));
        const constraints = [];

        if (
          this.filters.dateRange.enabled &&
            this.filters.dateRange.start &&
            this.filters.dateRange.end
        ) {
          const startDate = new Date(this.filters.dateRange.start);
          const endDate = new Date(this.filters.dateRange.end);
          constraints.push(where("timestamp", ">=", startDate));
          constraints.push(where("timestamp", "<=", endDate));
        }

        if (
          this.filters.users.enabled &&
            this.filters.users.selected.length > 0
        ) {
          constraints.push(
            where("author", "in", this.filters.users.selected)
          );
        }

        if (constraints.length > 0) {
          postsQuery = query(
            collection(firestore, "posts"),
            ...constraints,
            orderBy("timestamp", "desc")
          );
        }
        else {
          postsQuery = query(
            collection(firestore, "posts"),
            orderBy("timestamp", "desc"),
            limit(100)
          );
        }

        const querySnapshot = await getDocs(postsQuery);
        let posts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        if (
          this.filters.keywords.enabled &&
            this.filters.keywords.selected.length > 0
        ) {
          posts = posts.filter((post) =>
            this.filters.keywords.selected.some((keyword) =>
              post.content.toLowerCase().includes(keyword.toLowerCase())
            )
          );
        }

        return posts;
      }
      catch (error) {
        console.error("Error fetching filtered posts:", error);
        return [];
      }
    },

    resetForm() {
      this.newArchive = { name: "", description: "" };
      this.filters = {
        dateRange: { enabled: false, start: "", end: "" },
        users: { enabled: false, input: "", selected: [] },
        keywords: { enabled: false, input: "", selected: [] }
      };
      this.previewResults = [];
      this.estimatedPosts = 0;
    },

    async downloadArchivePdf(event, archive) {
      try {
        // Fetch full post data from Firestore using the stored post IDs
        const fullPosts = [];
        const userEmailCache = {}; // Cache to avoid duplicate user lookups

        if (archive.posts && archive.posts.length > 0) {
          for (const postId of archive.posts) {
            try {
              const postDoc = await getDoc(doc(firestore, "posts", postId));
              if (postDoc.exists()) {
                const postData = {
                  id: postDoc.id,
                  ...postDoc.data()
                };

                // Fetch user email if we haven't cached it yet
                if (postData.author && !userEmailCache[postData.author]) {
                  try {
                    const userDoc = await getDoc(
                      doc(firestore, "users", postData.author)
                    );
                    if (userDoc.exists()) {
                      userEmailCache[postData.author] = userDoc.data().email;
                    }
                    else {
                      userEmailCache[postData.author] = "Unknown User";
                    }
                  }
                  catch (userError) {
                    console.error(
                      `Error fetching user ${postData.author}:`,
                      userError
                    );
                    userEmailCache[postData.author] = "Unknown User";
                  }
                }

                // Add the email to the post data
                postData.authorEmail =
                    userEmailCache[postData.author] || "Unknown User";
                fullPosts.push(postData);
              }
            }
            catch (error) {
              console.error(`Error fetching post ${postId}:`, error);
            }
          }
        }

        const element = document.createElement("div");
        element.innerHTML = `
        <div style="font-family: Courier, sans-serif; padding: 20px; line-height: 1.6; color: black;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid black; padding-bottom: 20px;">
            <h1 style="margin: 0; font-size: 2em; color: black;">${archive.name}</h1>
            <p style="margin: 10px 0 0 0; color: #666; font-style: italic;">Digital Archive Export</p>
          </div>

          <div style="margin: 30px 0; display: flex; justify-content: space-between; background: #f8f8f8; padding: 15px; border-radius: 8px;">
            <div>
              <p style="margin: 5px 0;"><strong>Created By:</strong> ${archive.creatorEmail}</p>
              <p style="margin: 5px 0;"><strong>Created:</strong> ${this.formatDate(archive.createdAt)}</p>
              <p style="margin: 5px 0;"><strong>Total Posts:</strong> ${fullPosts.length}</p>
            </div>
            <div>
              <p style="margin: 5px 0;"><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          ${
  archive.description
    ? `
            <div style="margin: 20px 0; padding: 15px; background: #f0f7ff; border-left: 4px solid black; border-radius: 4px;">
              <h3 style="font-family: Helvetica, sans-serif; font-weight: bold; font-style: italic; margin: 0 0 10px 0; color: black;">Description</h3>
              <p style="margin: 0; line-height: 1.5;">${archive.description}</p>
            </div>
          `
    : ""
}

          <div style="margin: 30px 0;">
            <h2 style="font-family: Helvetica, sans-serif; font-weight: bold; font-style: italic; color: black; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">
              📝 Archived Posts (${fullPosts.length})
            </h2>

            ${fullPosts
    .map(
      (post) => `
              <div style="border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px; background: #d7c2a2; page-break-inside: avoid;">
                <div style="color: black; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                  <div style="color: black;">@${post.authorEmail || "Unknown User"}</div>                  <div style="color: #666; font-size: 0.9em;">${this.formatDate(post.timestamp)} | ${this.formatTime(post.timestamp)}</div>
                </div>
                <div style="color: black; font-weight: bold; line-height: 1.6; font-size: 1.1em;">
                  ${post.content || "No content available"}
                </div>
              </div>
            `
    )
    .join("")}

            ${
  fullPosts.length === 0
    ? `
              <div style="text-align: center; padding: 40px; color: #666; font-style: italic; background: #d7c2a2; border-radius: 8px;">
                <p style="margin: 0; font-size: 1.1em;">📭 No posts found in this archive</p>
              </div>
            `
    : ""
}
          </div>

          <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid black; text-align: center; color: #666; font-size: 0.9em;">
            <p style="margin: 0;">This archive was generated from the CapsLock social platform</p>
            <p style="margin: 5px 0 0 0;">Preserved for posterity • ${new Date().getFullYear()}</p>
          </div>
        </div>
      `;

        const options = {
          margin: [0.7, 0.7, 0.7, 0.7],
          filename: `${archive.name.replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, "_")}_archive.pdf`,
          image: {
            type: "jpeg",
            quality: 0.95
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: "#ffffff"
          },
          jsPDF: {
            unit: "in",
            format: "letter",
            orientation: "portrait"
          },
          pagebreak: {
            mode: ["avoid-all", "css"],
            before: ".page-break-before",
            after: ".page-break-after"
          }
        };

        const originalText = event.target.textContent;
        event.target.textContent = "Generating PDF...";
        event.target.disabled = true;

        await html2pdf().set(options).from(element).save();

        event.target.textContent = originalText;
        event.target.disabled = false;

        console.log("Archive downloaded as PDF successfully");
      }
      catch (error) {
        console.error("Error downloading archive as PDF:", error);
        alert("Failed to download archive as PDF. Please try again.");

        if (event && event.target) {
          event.target.textContent = "Download";
          event.target.disabled = false;
        }
      }
    },

    formatTime(timestamp) {
      if (!timestamp) return "Unknown";
      const date = timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);
      return date.toLocaleTimeString();
    },

    async loadArchives() {
      console.log("loadArchives called");
      console.log("Current user:", this.currentUser);

      if (!this.currentUser) {
        console.log("No current user, skipping archive load");
        return;
      }

      try {
        console.log("Loading archives for user:", this.currentUser.uid);

        const archivesQuery = query(
          collection(firestore, "archives"),
          where("creatorID", "==", this.currentUser.uid)
        );

        const querySnapshot = await getDocs(archivesQuery);

        this.archives = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        this.archives.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(b.createdAt);
          return dateB - dateA;
        });

        console.log("Loaded archives:", this.archives);
        console.log("Filtered archives:", this.filteredArchives);
      }
      catch (error) {
        console.error("Error loading archives:", error);
        this.archives = [];
      }
    },

    createNewArchive() {
      this.$router.push("/archives/create");
    },

    hasFilters(archive) {
      return (
        archive.dateRange ||
          (archive.keywords && archive.keywords.length > 0) ||
          (archive.userFilter && archive.userFilter.length > 0)
      );
    },

    formatDate(timestamp) {
      if (!timestamp) return "Unknown";
      const date = timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);
      return date.toLocaleDateString();
    },

    formatDateRange(dateRange) {
      if (!dateRange || !dateRange.start || !dateRange.end) {
        return "All time";
      }
      const start = this.formatDate(dateRange.start);
      const end = this.formatDate(dateRange.end);
      return `${start} - ${end}`;
    },

    async shareArchive(archive) {
      try {
        const shareUrl = `${window.location.origin}/archives/${archive.id}`;
        const shareText = `Archive: ${archive.name}\nCreated By: ${archive.creatorEmail}Description: ${archive.description}`;

        if (navigator.share) {
          await navigator.share({
            title: `Archive: ${archive.name}`,
            text: shareText,
            url: shareUrl
          });
        }
        else {
          await navigator.clipboard.writeText(shareUrl);
          alert("Archive link copied to clipboard!");
        }
      }
      catch (error) {
        console.error("Error sharing archive:", error);
        prompt(
          "Copy this link to share the archive:",
          `${window.location.origin}/archives/${archive.id}`
        );
      }
    }
  }
};
</script>

<style scoped>
  .archive-creator {
    position: absolute;
    top: 100px;
    right: 0;
    width: 30%;
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-left: 1px solid #ddd;
    height: calc(100vh - 100px);
    overflow-y: auto;
    z-index: 100;
  }

  .archive-details p {
    font-size: 1rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .archive-creator h2 {
    margin-top: 0;
    font-family: Helvetica, sans-serif;
    font-weight: bold;
    font-style: italic;
    color: black;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .form-textarea {
    height: 80px;
    resize: vertical;
  }

  .filter-group {
    margin-bottom: 1rem;
  }

  .date-inputs {
    display: flex;
    gap: 0.5rem;
  }

  .user-tag,
  .keyword-tag {
    background-color: #d7c2a2;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .remove-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
  }

  .btn-generate {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-generate:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

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
    margin-top: 100px;
    padding: 2rem;
    min-height: calc(100vh - 100px);
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
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .archive-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .archive-card-header h3 {
    margin: 0;
    color: black;
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
    color: black;
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
    color: black;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-family: Courier, sans-serif;
  }

  .archive-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-primary,
  .btn-secondary,
  .btn-tertiary {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: Courier, sans-serif;
    font-size: 0.9rem;
  }

  .btn-primary {
    background-color: #d7c2a2;
    color: black;
  }

  .btn-secondary {
    background-color: black;
    color: white;
  }

  .btn-tertiary {
    background-color: transparent;
    color: black;
    border: 1px solid black;
  }

  .btn-primary:hover,
  .btn-secondary:hover,
  .btn-tertiary:hover {
    opacity: 0.8;
  }

  .loading,
  .no-archives {
    text-align: center;
    padding: 3rem;
    color: black;
    font-family: Courier, sans-serif;
  }

  .no-archives p {
    margin-bottom: 1rem;
  }

  label {
    color: black;
    font-family: Courier, sans-serif;
  }
</style>
