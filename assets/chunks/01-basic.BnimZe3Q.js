const r=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 创建纵向滚动区域 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const items = ["项目概览", "组件规范", "设计令牌", "无障碍", "交互状态", "主题配置", "构建流程", "发布记录", "迁移指南", "常见问题"];
<\/script>

<template>
  <XhScrollAreaRoot type="always" style="block-size: 180px; inline-size: min(360px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 12px 16px">
        <div v-for="item in items" :key="item" style="padding-block: 7px">{{ item }}</div>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
`;export{r as default};
