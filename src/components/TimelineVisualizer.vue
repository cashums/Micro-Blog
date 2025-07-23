<template>
  <div class="timeline-visualizer">
    <!-- Timeline Header -->
    <div class="timeline-header">
      <h1>Platform Timeline</h1>
      <p>Explore the evolution of CapsLock through time</p>

      <!-- Date Range Selector -->
      <div class="date-controls">
        <div class="date-input-group">
          <label>From:</label>
          <input
            type="date"
            v-model="dateRange.start"
            @change="loadTimelineData"
            class="date-input"
          />
        </div>
        <div class="date-input-group">
          <label>To:</label>
          <input
            type="date"
            v-model="dateRange.end"
            @change="loadTimelineData"
            class="date-input"
          />
        </div>
        <button @click="resetToFullRange" class="btn-reset">
          Full Timeline
        </button>
      </div>
    </div>

    <!-- Timeline Visualization -->
    <div class="timeline-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>📊 Loading timeline data...</p>
      </div>

      <!-- Main Timeline -->
      <div v-else class="timeline-main">
        <!-- Activity Chart -->
        <div class="activity-chart">
          <h3>Post Activity Over Time</h3>
          <div class="chart-container">
            <svg
              class="activity-line"
              :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
            >
              <polyline
                :points="activityPoints"
                fill="none"
                stroke="#d73027"
                stroke-width="3"
              ></polyline>
              <!-- Data points -->
              <circle
                v-for="(point, index) in activityBars"
                :key="index"
                :cx="point.x"
                :cy="point.y"
                r="4"
                fill="#d73027"
                @click="selectTimePoint(point.date)"
                @mouseenter="showActivityTooltip($event, point)"
                @mouseleave="hideActivityTooltip"
                class="data-point"
              />
            </svg>

            <!-- Tooltip for activity -->
            <div
              v-if="activityTooltip.visible"
              class="activity-tooltip"
              :style="{
                left: activityTooltip.x + 'px',
                top: activityTooltip.y + 'px'
              }"
            >
              <div class="tooltip-content">
                <strong>{{ formatDate(activityTooltip.date) }}</strong>
                <p>{{ activityTooltip.count }} Total Posts</p>
                <p>{{ activityTooltip.dailyCount }} Posts Today</p>
              </div>
            </div>
          </div>
        </div>

        <div class="timeline-scale">
          <div
            v-for="(marker, index) in timeMarkers"
            :key="index"
            class="time-marker"
            :style="{ left: marker.position + '%' }"
          >
            <div class="marker-line"></div>
            <div class="marker-label">{{ marker.label }}</div>
          </div>
        </div>

        <!-- User Growth Chart -->
        <div class="growth-chart">
          <h3>User Growth</h3>
          <div class="chart-container">
            <svg
              class="growth-line"
              :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
            >
              <polyline
                :points="userGrowthPoints"
                fill="none"
                stroke="#007acc"
                stroke-width="3"
              ></polyline>
              <!-- Data points -->
              <circle
                v-for="(point, index) in userGrowthData"
                :key="index"
                :cx="point.x"
                :cy="point.y"
                r="4"
                fill="#007acc"
                @click="selectTimePoint(point.date)"
                @mouseenter="showUserTooltip($event, point)"
                @mouseleave="hideUserTooltip"
                class="data-point"
              />
            </svg>

            <!-- Tooltip for user growth -->
            <div
              v-if="userTooltip.visible"
              class="user-tooltip"
              :style="{
                left: userTooltip.x + 'px',
                top: userTooltip.y + 'px'
              }"
            >
              <div class="tooltip-content">
                <strong>{{ formatDate(userTooltip.date) }}</strong>
                <p>{{ userTooltip.totalUsers }} Total Users</p>
                <p>{{ userTooltip.newUsers }} New Users</p>
                <p>{{ userTooltip.activeUsers }} Active Users</p>
              </div>
            </div>

          </div>
        </div>

        <div class="timeline-scale">
          <div
            v-for="(marker, index) in timeMarkers"
            :key="index"
            class="time-marker"
            :style="{ left: marker.position + '%' }"
          >
            <div class="marker-line"></div>
            <div class="marker-label">{{ marker.label }}</div>
          </div>
        </div>

      </div>
    </div>

    <!-- Selected Time Point Details -->
    <div v-if="selectedTimePoint" class="time-snapshot">
      <div class="snapshot-header">
        <button
          style="float: right; background: red; color: white"
          @click="clearSelection"
          class="btn-close"
        >
          ×
        </button>
        <h3>📸 Snapshot: {{ formatDate(selectedTimePoint.date) }}</h3>
      </div>

      <div class="snapshot-stats">
        <br />
        <p>{{ selectedTimePoint.posts }} Posts</p>
        <p>{{ selectedTimePoint.users }} Active Users</p>
        <p>{{ selectedTimePoint.archives }} Archives Created</p>
      </div>

      <div class="snapshot-posts">
        <h4>Posts from this time:</h4>
        <div class="sample-posts">
          <div
            v-for="post in selectedTimePoint.samplePosts"
            :key="post.id"
            class="sample-post"
          >
            <div class="post-header">
              <strong>{{ post.authorEmail }}</strong>
              <span class="post-time">{{ formatTime(post.timestamp) }}</span>
            </div>
            <p class="post-content">{{ post.content }}</p>
          </div>
        </div>
      </div>

      <button @click="createSnapshotArchive" class="btn-archive">
        Create Archive from this Snapshot
      </button>
      <button @click="viewFullData" class="btn-view">View All Data</button>
    </div>
  </div>
</template>

<script>
import { firestore } from "@/firebaseResources.js";
import { auth } from "@/firebaseResources.js";
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
  Timestamp
} from "firebase/firestore";

export default {
  name: "TimelineVisualizer",

  data() {
    return {
      currentUser: null,
      loading: true,
      dateRange: {
        start: "",
        end: ""
      },
      timelineData: [],
      userGrowthData: [],
      activityBars: [],
      selectedTimePoint: null,
      chartWidth: 800,
      chartHeight: 200,

      userTooltip: {
        visible: false,
        x: 0,
        y: 0,
        date: null,
        totalUsers: 0,
        newUsers: 0
      },

      activityTooltip: {
        visible: false,
        x: 0,
        y: 0,
        date: null,
        count: 0
      },

      // Computed timeline properties
      timeMarkers: [],
      userGrowthPoints: "",
      activityPoints: "",

    };
  },

  mounted() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      await this.initializeTimeline();
    });
  },

  methods: {
    generateActivityBars() {
      // Group posts by day
      const dailyActivity = {};

      this.timelineData.forEach((post) => {
        const dateKey = post.date.toDateString();
        dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + 1;
      });

      // Convert to array and sort by date
      const dailyActivityArray = Object.entries(dailyActivity)
        .map(([dateStr, count]) => ({
          date: new Date(dateStr),
          dailyCount: count,
          cumulativeCount: 0 // Will be calculated below
        }))
        .sort((a, b) => a.date - b.date);

      // Calculate cumulative totals
      let cumulativeTotal = 0;
      dailyActivityArray.forEach((point) => {
        cumulativeTotal += point.dailyCount;
        point.cumulativeCount = cumulativeTotal;
      });

      const maxActivity = Math.max(...dailyActivityArray.map(d => d.cumulativeCount), 1);

      this.activityBars = dailyActivityArray.map((point) => {
        return {
          date: point.date,
          count: point.cumulativeCount, // Use cumulative count for display
          dailyCount: point.dailyCount, // Keep daily count for tooltip
          height: (point.cumulativeCount / maxActivity) * 100,
          position: this.calculateTimePosition(point.date),
          color: this.getActivityColor(point.cumulativeCount, maxActivity),
          x: this.calculateTimePosition(point.date) * (this.chartWidth / 100),
          y: this.chartHeight - (point.cumulativeCount / maxActivity) * (this.chartHeight - 20)
        };
      });

      // Generate points string for polyline
      this.activityPoints = this.activityBars
        .map((point) => `${point.x},${point.y}`)
        .join(" ");
    },

    showActivityTooltip(event, point) {
      const rect = event.target.getBoundingClientRect();
      const containerRect = event.target.closest('.chart-container').getBoundingClientRect();
      
      this.activityTooltip = {
        visible: true,
        x: rect.left - containerRect.left + 10,
        y: rect.top - containerRect.top - 60,
        date: point.date,
        count: point.count, // Total posts up to this date
        dailyCount: point.dailyCount // Posts on this specific day
      };
    },


    hideActivityTooltip() {
      this.activityTooltip.visible = false;
    },

    showUserTooltip(event, point) {
      const rect = event.target.getBoundingClientRect();
      const containerRect = event.target.closest('.chart-container').getBoundingClientRect();
      
      this.userTooltip = {
        visible: true,
        x: rect.left - containerRect.left + 10,
        y: rect.top - containerRect.top - 60,
        date: point.date,
        totalUsers: point.totalUsers,
        newUsers: point.users, // Now correctly shows new users
        activeUsers: point.activeUsers // Add active users info
      };
    },

    hideUserTooltip() {
      this.userTooltip.visible = false;
    },

    async initializeTimeline() {
      this.loading = true;

      const now = new Date();
      const websiteLaunchDate = new Date("2025-07-10");

      this.dateRange.start = websiteLaunchDate.toISOString().split("T")[0];
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 1);
      this.dateRange.end = endDate.toISOString().split("T")[0];

      await this.loadTimelineData();
      this.loading = false;
    },

    async loadTimelineData() {
      try {
        // Load posts data
        await this.loadPostsData();

        // Load user registration data
        await this.loadUserData();

        // Process data for visualization
        this.processTimelineData();
      }
      catch (error) {
        console.error("Error loading timeline data:", error);
      }
    },

    async loadPostsData() {
      const startDate = new Date(this.dateRange.start);
      const endDate = new Date(this.dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day

      const postsQuery = query(
        collection(firestore, "posts"),
        where("timestamp", ">=", Timestamp.fromDate(startDate)),
        where("timestamp", "<=", Timestamp.fromDate(endDate)),
        orderBy("timestamp", "asc")
      );

      const querySnapshot = await getDocs(postsQuery);
      this.timelineData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().timestamp.toDate()
      }));
    },

    async loadUserData() {
      // Track when each user first appeared (posted) on the platform
      const userFirstAppearance = {};
      const dailyNewUsers = {};
      const dailyActiveUsers = {};

      // Find first appearance date for each user
      for (const post of this.timelineData) {
        const userId = post.author;
        const postDate = post.date;
        
        if (!userFirstAppearance[userId] || postDate < userFirstAppearance[userId]) {
          userFirstAppearance[userId] = postDate;
        }
      }

      // Count new users and active users per day
      for (const post of this.timelineData) {
        const dateKey = post.date.toDateString();
        const userId = post.author;
        
        // Track active users (users who posted on this day)
        if (!dailyActiveUsers[dateKey]) {
          dailyActiveUsers[dateKey] = new Set();
        }
        dailyActiveUsers[dateKey].add(userId);
        
        // Check if this is the user's first appearance (new user)
        const firstAppearanceKey = userFirstAppearance[userId].toDateString();
        if (firstAppearanceKey === dateKey) {
          if (!dailyNewUsers[dateKey]) {
            dailyNewUsers[dateKey] = new Set();
          }
          dailyNewUsers[dateKey].add(userId);
        }
      }

      this.userGrowthData = Object.keys(dailyActiveUsers)
        .map(dateKey => {
          const date = new Date(dateKey);
          return {
            date: date,
            users: dailyNewUsers[dateKey] ? dailyNewUsers[dateKey].size : 0, // New users on this day
            activeUsers: dailyActiveUsers[dateKey].size, // Active users on this day
            totalUsers: 0 // Will be calculated below
          };
        })
        .sort((a, b) => a.date - b.date);

      // Calculate cumulative user count (total unique users up to this point)
      let totalUsers = 0;
      this.userGrowthData.forEach((point) => {
        totalUsers += point.users; // Add new users to running total
        point.totalUsers = totalUsers;
      });
    },

    processTimelineData() {
      this.generateTimeMarkers();
      this.generateActivityBars();
      this.generateUserGrowthChart();
    },

    generateTimeMarkers() {
      const start = new Date(this.dateRange.start);
      const end = new Date(this.dateRange.end);
      const totalDays = (end - start) / (1000 * 60 * 60 * 24);

      this.timeMarkers = [];

      // Generate 5-7 evenly spaced markers
      const markerCount = Math.min(
        7,
        Math.max(3, Math.floor(totalDays / 30))
      );

      for (let i = 0; i <= markerCount; i++) {
        const position = (i / markerCount) * 100;
        const date = new Date(
          start.getTime() + (end - start) * (i / markerCount)
        );

        this.timeMarkers.push({
          position,
          label: this.formatDateShort(date),
          date
        });
      }
    },

    generateUserGrowthChart() {
      if (this.userGrowthData.length === 0) return;

      const maxUsers = Math.max(
        ...this.userGrowthData.map((d) => d.totalUsers)
      );

      this.userGrowthData = this.userGrowthData.map((point) => ({
        ...point,
        x: this.calculateTimePosition(point.date) * (this.chartWidth / 100),
        y:
            this.chartHeight -
            (point.totalUsers / maxUsers) * (this.chartHeight - 20)
      }));

      this.userGrowthPoints = this.userGrowthData
        .map((point) => `${point.x},${point.y}`)
        .join(" ");
    },

    calculateTimePosition(date) {
      const start = new Date(this.dateRange.start).getTime();
      const end = new Date(this.dateRange.end).getTime();
      const current = date.getTime();

      return ((current - start) / (end - start)) * 100;
    },

    getActivityColor(count, maxCount) {
      const intensity = count / maxCount;
      if (intensity > 0.8) return "#d73027";
      if (intensity > 0.6) return "#fc8d59";
      if (intensity > 0.4) return "#fee08b";
      if (intensity > 0.2) return "#e0f3f8";
      return "#abd9e9";
    },

    async selectTimePoint(date) {
      // Get data for the selected date
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPosts = this.timelineData.filter(
        (post) => post.date >= dayStart && post.date <= dayEnd
      );

      // Get user emails for the posts
      const userEmailCache = {};
      const samplePosts = [];

      for (const post of dayPosts) {
        if (!userEmailCache[post.author]) {
          try {
            const userDoc = await getDoc(
              doc(firestore, "users", post.author)
            );
            userEmailCache[post.author] = userDoc.exists()
              ? userDoc.data().email
              : "Unknown User";
          }
          catch {
            userEmailCache[post.author] = "Unknown User";
          }
        }

        samplePosts.push({
          ...post,
          authorEmail: userEmailCache[post.author]
        });
      }

      samplePosts.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

      this.selectedTimePoint = {
        date,
        posts: dayPosts.length,
        users: new Set(dayPosts.map((p) => p.author)).size,
        archives: 0,
        samplePosts
      };
    },

    clearSelection() {
      this.selectedTimePoint = null;
    },

    async createSnapshotArchive() {
      if (!this.selectedTimePoint || !this.currentUser) return;

      try {
        const dayStart = new Date(this.selectedTimePoint.date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(this.selectedTimePoint.date);
        dayEnd.setHours(23, 59, 59, 999);

        let dayPosts = this.timelineData.filter(
          (post) => post.date >= dayStart && post.date <= dayEnd
        );

        // Sort posts in descending order by timestamp
        dayPosts = dayPosts.sort(
          (a, b) => b.timestamp.toDate() - a.timestamp.toDate()
        );

        const archiveData = {
          name: `Snapshot - ${this.formatDate(this.selectedTimePoint.date)}`,
          description: `Automated snapshot archive containing the ${dayPosts.length} posts from ${this.formatDate(this.selectedTimePoint.date)}`,
          creatorID: this.currentUser.uid,
          creatorEmail: this.currentUser.email,
          createdAt: new Date(),
          postCount: dayPosts.length,
          snapshotDate: this.selectedTimePoint.date,
          posts: dayPosts.map((post) => post.id)
        };

        await addDoc(collection(firestore, "archives"), archiveData);

        alert(
          `Snapshot archive created successfully with ${dayPosts.length} posts!`
        );
      }
      catch (error) {
        console.error("Error creating snapshot archive:", error);
        alert("Failed to create snapshot archive. Please try again.");
      }
    },

    viewFullData() {
      // Navigate to a detailed view or expand the current view
      this.$router.push({
        name: "HistoricalSearch",
        query: {
          date: this.selectedTimePoint.date.toISOString().split("T")[0]
        }
      });
    },

    resetToFullRange() {
      const now = new Date();
      const websiteLaunchDate = new Date("2025-07-10");

      this.dateRange.start = websiteLaunchDate.toISOString().split("T")[0];

      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 1);
      this.dateRange.end = endDate.toISOString().split("T")[0];

      this.loadTimelineData();
    },

    formatDate(date) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    },

    formatDateShort(date) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    },

    formatTime(timestamp) {
      const date = timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }
};
</script>

<style scoped>
  .btn-archive,
  .btn-view {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-family: Courier, sans-serif;
    font-weight: bold;
    font-size: 1rem;
    transition: all 0.2s ease-in-out;
    transform: translateY(-2px);
    background: #d7c2a2;
    margin-right: 0.5rem;
    margin-top: 2rem;
  }

  .user-tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    pointer-events: none;
    z-index: 1000;
    white-space: nowrap;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    font-family: Courier, sans-serif;
  }

  .user-tooltip .tooltip-content {
    text-align: left;
  }

  .user-tooltip .tooltip-content strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #007acc;
  }

  .user-tooltip .tooltip-content p {
    margin: 0.1rem 0;
    font-size: 0.8rem;
  }

  .data-point {
    cursor: pointer;
    transition: all 0.2s;
  }

  .data-point:hover {
    filter: drop-shadow(0 0 4px #007acc);
  }

  .snapshot-posts {
    margin-top: 2rem;
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .snapshot-posts h4 {
    margin-bottom: 1rem;
    font-family: Helvetica, sans-serif;
    font-weight: bold;
    font-size: 1.5rem;
    color: #333;
  }

  .sample-posts {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sample-post {
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 1rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: bold;
    color: #333;
  }

  .post-time {
    font-size: 0.9rem;
    color: #666;
  }

  .post-content {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
    color: #333;
  }

  .timeline-visualizer {
    width: 75vw;
    margin: 0;
    margin-top: 100px;
    padding: 2rem;
    font-family: Courier, sans-serif;
    min-height: calc(100vh - 100px);
  }

  .timeline-header {
    text-align: center;
    margin-bottom: 3rem;
    width: 100%;
  }

  .timeline-header h1 {
    font-family: Helvetica, sans-serif;
    font-weight: bold;
    font-style: italic;
    color: black;
    margin-bottom: 0.5rem;
    font-size: 2.5rem;
  }

  .timeline-header p {
    color: #666;
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .date-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .date-input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .date-input-group label {
    font-weight: bold;
    color: #333;
    min-width: 60px;
  }

  .date-input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: Courier, sans-serif;
    min-width: 150px;
  }

  .btn-reset {
    background-color: #d7c2a2;
    color: black;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-family: Courier, sans-serif;
    font-weight: bold;
  }

  .snapshot-stats {
    color: black;
    font-family: Courier, sans-serif;
    font-weight: bold;
  }

  .btn-reset:hover {
    background-color: #c4b091;
  }

  .timeline-container {
    margin-top: 2rem;
    width: 100%;
  }

  .loading-state {
    text-align: center;
    padding: 3rem;
    color: #666;
    font-size: 1.2rem;
  }

  .snapshot-header {
    font-family: Helvetica, sans-serif;
    font-weight: bold;
    font-style: italic;
    color: black;
  }

  .timeline-main {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    width: 100%;
  }

  .timeline-scale {
    position: relative;
    height: 60px;
    border-bottom: 3px solid #333;
    margin-bottom: 4rem;
    margin-left: 2rem;
    width: 95%;
  }

  .time-marker {
    position: absolute;
    transform: translateX(-7%);
  }

  .marker-line {
    width: 3px;
    height: 60px;
    background-color: #333;
    margin-bottom: 10px;
  }

  .marker-label {
    font-size: 0.9rem;
    color: #666;
    white-space: nowrap;
    font-weight: bold;
  }

  .activity-chart,
  .growth-chart {
    border: 1px solid #ddd;
    border-radius: 12px;
    width: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .activity-chart h3,
  .growth-chart h3 {
    margin: 0 0 1.5rem 0;
    color: #333;
    font-size: 1.3rem;
    font-weight: bold;
    padding-left: 1rem;
    padding-top: 1rem;
  }

  .chart-container {
    position: relative;
    height: 250px;
    border-bottom: 2px solid #ddd;
    border-left: 2px solid #ddd;
    border-radius: 4px;
    width: 100%;
    overflow: visible; /* Allow tooltip to show outside container */
  }

  .activity-tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    pointer-events: none;
    z-index: 1000;
    white-space: nowrap;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    font-family: Courier, sans-serif;
  }

  .activity-tooltip .tooltip-content {
    text-align: left;
  }

  .activity-tooltip .tooltip-content strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #d73027;
  }

  .activity-tooltip .tooltip-content p {
    margin: 0.1rem 0;
    font-size: 0.8rem;
  }

  .activity-line {
    width: 100%;
    height: 100%;
  }

  .activity-bar {
    position: absolute;
    bottom: 0;
    width: 4px;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px 2px 0 0;
  }

  .activity-bar:hover {
    opacity: 0.7;
    transform: scaleY(1.1);
  }

  .growth-line {
    width: 100%;
    height: 100%;
  }

  .data-point {
    cursor: pointer;
    transition: all 0.2s;
  }

  .data-point:hover {
    filter: drop-shadow(0 0 4px #007acc);
  }

  .time-snapshot {
    margin-top: 3rem;
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 2rem;
    width: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
</style>