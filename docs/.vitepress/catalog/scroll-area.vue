<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const items = ["项目概览", "组件规范", "设计令牌", "无障碍", "交互状态", "主题配置", "构建流程", "发布记录"];
</script>

<template>
  <XhScrollAreaRoot type="always" style="block-size: 150px; inline-size: 220px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 8px 12px">
        <div v-for="item in items" :key="item" style="padding-block: 6px">{{ item }}</div>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
