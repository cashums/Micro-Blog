<template>
  <div class="timeline-view">
    <TimelineVisualizer />
  </div>
</template>

<script>
import TimelineVisualizer from "@/components/TimelineVisualizer.vue";

export default {
  name: "TimelineView",

  components: {
    TimelineVisualizer
  }
};
</script>

<style scoped>
  .timeline-view {
    width: 100%; /* Ensure it spans the full width */
    min-height: 100vh; /* Ensure it fills the viewport height */
    display: flex;
    justify-content: center; /* Center the content horizontally */
    align-items: flex-start;
  }
</style>
