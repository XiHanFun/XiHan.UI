<!-- 基础用法 | 二维排布容器：cols 定分几列，gap 走间距档位，每一格按文档序依次落格 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle =
  "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

const cells = ["甲", "乙", "丙", "丁", "戊", "己"];
</script>

<template>
  <XhGridRoot :cols="3" gap="md">
    <XhGridItem v-for="c in cells" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
  </XhGridRoot>
</template>
