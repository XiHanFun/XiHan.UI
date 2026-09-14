<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = {
  name: "曦寒视图",
  stars: 128,
  active: true,
  tags: ["框架无关", "跨端"],
};
</script>

<template>
  <XhJsonViewerRoot :value="payload" style="inline-size: 240px; font-size: 12px" />
</template>
