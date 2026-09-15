<!-- 方向 | 设置水平或垂直排列 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const items = [
  { id: "设计", tone: "brand" },
  { id: "开发", tone: "info" },
  { id: "测试", tone: "success" },
] as const;
</script>

<template>
  <XhFlex orientation="vertical" gap="lg">
    <XhFlex gap="sm">
      <span v-for="item in items" :key="item.id" data-demo-block :data-tone="item.tone" style="--xh-demo-block-inline-size: 72px" />
    </XhFlex>
    <XhFlex orientation="vertical" gap="sm" style="inline-size: 120px">
      <span v-for="item in items" :key="item.id" data-demo-block :data-tone="item.tone" />
    </XhFlex>
  </XhFlex>
</template>
