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
    Archive
  }
};
</script>

<style scoped>
  .archive-view {
    width: 75vw;
    margin: 0 auto;
    margin-top: 100px;
    padding: 2rem;
    font-family: Courier, sans-serif;
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
