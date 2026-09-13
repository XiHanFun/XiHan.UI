const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 响应式列 | 在不同视口使用不同列数 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const sections = ["概览", "分析", "报告", "设置"];
<\/script>

<template>
  <XhGridRoot :cols="{ base: 1, sm: 2, lg: 4 }" gap="sm" style="inline-size: min(720px, 100%)">
    <XhGridItem
      v-for="section in sections"
      :key="section"
      style="padding: 20px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); text-align: center"
    >
      {{ section }}
    </XhGridItem>
  </XhGridRoot>
</template>
`;export{n as default};
