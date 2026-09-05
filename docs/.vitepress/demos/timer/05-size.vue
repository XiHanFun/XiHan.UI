<!-- 三个尺寸档 | size 只写在 root 上，数字大小与起停按钮的高度一起换档，子部件不重复标注 -->
<script setup lang="ts">
import {
  XhTimerDisplay,
  XhTimerControl,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
const oneMinute = 60 * 1000;
</script>

<template>
  <div v-for="size in sizes" :key="size" style="margin-block-end: 12px">
    <XhTimerRoot :size="size" countdown :start-ms="oneMinute">
      <XhTimerDisplay>
        <XhTimerItem unit="minutes" />
        <XhTimerSeparator>:</XhTimerSeparator>
        <XhTimerItem unit="seconds" />
      </XhTimerDisplay>
      <XhTimerControl>起停</XhTimerControl>
    </XhTimerRoot>
  </div>
</template>
