<!-- 基础用法 | 一维排布容器：子项横着排，间距走档位，容器自己不给子项加任何样式 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const boxStyle =
  "padding: 8px 14px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";
</script>

<template>
  <XhFlex gap="sm">
    <span :style="boxStyle">甲</span>
    <span :style="boxStyle">乙</span>
    <span :style="boxStyle">丙</span>
  </XhFlex>
</template>
