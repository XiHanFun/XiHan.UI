<!-- 尺寸 | size 换的是段的高度、内边距与字号，指示器跟着量出来的段走 -->
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
const aligns = [
  { value: "start", label: "左" },
  { value: "center", label: "中" },
  { value: "end", label: "右" },
];
</script>

<template>
  <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap">
    <XhSegmentedRoot
      v-for="s in sizes"
      :key="s"
      :collection="aligns"
      :size="s"
      :aria-label="s"
      default-value="center"
    />
  </div>
</template>
