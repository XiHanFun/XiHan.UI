<!-- 方向 | 设置渐变方向 -->
<script setup lang="ts">
import { XhGradientText } from "@xihan-ui/vue";

const directions = [
  { label: "向右", value: "to-right" },
  { label: "向下", value: "to-bottom" },
  { label: "右下", value: "to-bottom-right" },
  { label: "右上", value: "to-top-right" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 24px; font-weight: 700">
    <XhGradientText v-for="direction in directions" :key="direction.value" :direction="direction.value" from="#f97316" to="#2563eb">
      {{ direction.label }}
    </XhGradientText>
  </div>
</template>
