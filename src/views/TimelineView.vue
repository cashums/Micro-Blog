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
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
</style>
