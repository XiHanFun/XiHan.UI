<!-- 竖排 | orientation 决定方向键收哪一对键（另一轴原样放行给页面），分隔线的朝向恒与主轴垂直 -->
<script setup lang="ts">
import {
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";

const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};
</script>

<template>
  <XhToolbarRoot orientation="vertical" style="inline-size: 140px">
    <XhToolbarItem value="zoom-in" :style="itemStyle">放大</XhToolbarItem>
    <XhToolbarItem value="zoom-out" :style="itemStyle">缩小</XhToolbarItem>
    <XhToolbarSeparator />
    <XhToolbarItem value="fit" :style="itemStyle">适应画布</XhToolbarItem>
  </XhToolbarRoot>
</template>
