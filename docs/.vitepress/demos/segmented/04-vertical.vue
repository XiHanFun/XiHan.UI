<!-- 竖排 | orientation 只改视觉排布，四个方向键与 Home/End 照样都能走 -->
<script setup lang="ts">
import { XhSegmentedRoot } from "@xihan-ui/vue";

const densities = [
  { value: "compact", label: "紧凑" },
  { value: "cozy", label: "适中" },
  { value: "comfortable", label: "宽松" },
];
</script>

<template>
  <XhSegmentedRoot
    :collection="densities"
    orientation="vertical"
    default-value="cozy"
    aria-label="行高"
  />
</template>
