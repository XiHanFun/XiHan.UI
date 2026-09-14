<!-- 跨列与错列 | 控制内容占用的列 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const itemStyle = "padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)";
</script>

<template>
  <XhGridRoot :cols="4" gap="sm" style="inline-size: min(640px, 100%)">
    <XhGridItem :span="3" :style="itemStyle">项目概览</XhGridItem>
    <XhGridItem :style="itemStyle">动态</XhGridItem>
    <XhGridItem :span="2" :style="itemStyle">任务</XhGridItem>
    <XhGridItem :span="2" :style="itemStyle">成员</XhGridItem>
    <XhGridItem :offset="1" :span="2" style="padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand)">居中区域</XhGridItem>
  </XhGridRoot>
</template>
