<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 自适应列 | 根据最小列宽自动排列 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const features = ["无头内核", "Vue", "React", "Web Components", "设计令牌", "无障碍"];
</script>

<template>
  <XhGridRoot min-col-width="sm" gap="sm" style="inline-size: min(640px, 100%)">
    <XhGridItem
      v-for="feature in features"
      :key="feature"
      style="padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
    >
      {{ feature }}
    </XhGridItem>
  </XhGridRoot>
</template>
