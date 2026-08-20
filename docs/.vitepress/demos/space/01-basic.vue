<!-- 基础用法 | 一排东西挨着摆：什么参数都不写也留 md 间距，这是它与弹性容器的分野 -->
<script setup lang="ts">
import { XhSpace } from "@xihan-ui/vue";

const boxStyle =
  "padding: 6px 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";
</script>

<template>
  <XhSpace>
    <span :style="boxStyle">甲</span>
    <span :style="boxStyle">乙</span>
    <span :style="boxStyle">丙</span>
  </XhSpace>
</template>
