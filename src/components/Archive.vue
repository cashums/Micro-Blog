<template>
  <div class="archive">
    <div v-if="loading" class="loading-state">Loading archive details...</div>
    <div v-else>
      <h2>{{ archive.name || "Unnamed Archive" }}</h2>
      <p>
        <strong>Description:</strong>
        {{ archive.description || "No description provided." }}
      </p>
      <p>
        <strong>Created By:</strong> {{ archive.creatorEmail || "Unknown" }}
      </p>
      <p>
        <strong>Created On:</strong>
        {{ archive.createdAt ? formatDate(archive.createdAt) : "Invalid Date" }}
      </p>
      <p><strong>Post Count:</strong> {{ archive.postCount || 0 }}</p>
      <div class="posts">
        <h3>Posts in this Archive:</h3>
        <div v-if="loadingPosts" class="loading-state">Loading posts...</div>
        <ul v-else>
          <li v-for="post in archivePosts" :key="post.id">
            <div class="post-header">
              <strong>{{ post.authorEmail || "Unknown User" }}</strong>
              <span class="post-time">
                {{ formatDate(post.timestamp) }} | {{ formatTime(post.timestamp) }}
              </span>
            </div>
            <p class="post-content">
              {{ post.content || "No content available" }}
            </p>
          </li>
        </ul>
      </div>
    </div>
    <button @click="downloadArchivePdf($event, archive)" class="btn">
      Download
    </button>
  </div>
</template>

<script>
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebaseResources.js";
import html2pdf from "html2pdf.js";

export default {
  name: "ArchiveItem",
  props: {
    archiveId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      archive: null,
      archivePosts: [],
      loading: true,
      loadingPosts: false
    };
  },
  async mounted() {
    await this.loadArchive();
    await this.loadArchivePosts();
  },
  methods: {
    async loadArchive() {
      try {
        const archiveDoc = await getDoc(
          doc(firestore, "archives", this.archiveId)
        );
        if (archiveDoc.exists()) {
          const archiveData = archiveDoc.data();

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
      if (
        !this.archive ||
          !this.archive.posts ||
          this.archive.posts.length === 0
      ) {
        return;
      }

      this.loadingPosts = true;

      try {
        const postPromises = this.archive.posts.map(async (postId) => {
          const postDoc = await getDoc(doc(firestore, "posts", postId));
          if (postDoc.exists()) {
            const postData = postDoc.data();

            let authorEmail = "Unknown User";
            try {
              const userDoc = await getDoc(
                doc(firestore, "users", postData.author)
              );
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
              timestamp: postData.timestamp?.toDate
                ? postData.timestamp.toDate()
                : new Date(postData.timestamp) // Ensure timestamp is converted
            };
          }
          return null;
        });

        const posts = await Promise.all(postPromises);
        this.archivePosts = posts.filter((post) => post !== null);

        this.archivePosts.sort((a, b) => {
          const timestampA = a.timestamp || new Date();
          const timestampB = b.timestamp || new Date();
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

    async downloadArchivePdf(event, archive) {
      try {
        const fullPosts = [];
        const userEmailCache = {};

        if (archive.posts && archive.posts.length > 0) {
          for (const postId of archive.posts) {
            try {
              const postDoc = await getDoc(doc(firestore, "posts", postId));
              if (postDoc.exists()) {
                const postData = {
                  id: postDoc.id,
                  ...postDoc.data()
                };

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

    formatDate(date) {
      if (!date || isNaN(new Date(date).getTime())) {
        return "Invalid Date";
      }
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    },

    formatTime(timestamp) {
      const date = timestamp?.toDate
        ? timestamp.toDate()
        : new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }
  }
};
</script>

<style scoped>
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: Courier, sans-serif;
    font-size: 0.9rem;
    background-color: black;
    color: white;
    display: block;
    margin: 2rem auto 0 auto;
  }

  .archive {
    width: 75vw;
    margin: 0 auto;
    font-family: Courier, sans-serif;
    min-height: calc(100vh - 100px);
  }

  .loading-state {
    text-align: center;
    font-size: 1.2rem;
    color: #666;
    padding: 3rem;
    font-family: Courier, sans-serif;
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
    font-family: Courier, sans-serif;
  }

  .posts {
    margin-top: 2rem;
  }

  .posts h3 {
    font-size: 1.3rem;
    font-family: Helvetica, sans-serif;
    font-weight: bold;
    font-style: italic;
    color: black;
    margin-bottom: 1rem;
  }

  .posts ul {
    list-style-type: disc;
    padding-left: 0;
  }

  .posts li {
    border: 1px solid #ddd;
    margin: 20px 0;
    padding: 20px;
    border-radius: 8px;
    background: #d7c2a2;
    font-family: Courier, sans-serif;
  }

  .post-header {
    color: black;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    font-family: Courier, sans-serif;
  }

  .post-header strong {
    color: black;
    font-weight: bold;
  }

  .post-time {
    color: #666;
    font-size: 0.9em;
    font-family: Courier, sans-serif;
  }

  .post-content {
    color: black;
    font-weight: bold;
    line-height: 1.6;
    font-size: 1.1em;
    margin: 0;
    font-family: Courier, sans-serif;
  }
</style>
