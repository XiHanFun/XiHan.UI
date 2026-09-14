<script setup lang="ts">
import { XhTagGroupRoot } from "@xihan-ui/vue";

const tags = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "wc", label: "Web Components" },
];
</script>

<template>
  <XhTagGroupRoot :collection="tags" label="技术栈" deletable />
</template>
