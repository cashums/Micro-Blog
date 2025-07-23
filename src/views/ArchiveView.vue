<template>
  <div class="archive-view">
    <h1>Archive Details</h1>
    <Archive :archiveId="$route.params.id" />
  </div>
</template>

<script>
import Archive from "@/components/Archive.vue";

export default {
  name: "ArchiveView",
  components: {
    Archive,
  },
};
</script>

<style scoped>
.archive-view {
  width: 75vm;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 100px;
  padding: 2rem;
  font-family: Courier, sans-serif;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  font-family: Helvetica, sans-serif;
  font-weight: bold;
  font-style: italic;
  color: black;
  text-align: center;
  margin-bottom: 2rem;
}
</style>
