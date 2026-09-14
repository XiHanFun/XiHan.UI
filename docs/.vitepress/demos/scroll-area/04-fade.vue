<!-- 边缘渐隐 | 提示还有更多内容 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const rows = ["概览", "组件", "指南", "示例", "设计令牌", "无障碍", "主题", "动效", "国际化", "发布记录", "迁移指南", "常见问题"];
</script>

<template>
  <XhScrollAreaRoot
    variant="fade"
    size="lg"
    style="block-size: 180px; inline-size: min(320px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 12px 16px">
        <p v-for="row in rows" :key="row" style="margin: 0; line-height: 30px">
          {{ row }}
        </p>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
