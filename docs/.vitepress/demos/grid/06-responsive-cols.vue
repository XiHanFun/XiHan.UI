<!-- 响应式列数 | cols 除了整数也收断点对象，逐档写各自的列数：窄视口一列，越宽排得越密，拖动窗口即可看到换档 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle =
  "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default); text-align: center";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const cards = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛"];
</script>

<template>
  <XhGridRoot gap="lg">
    <!-- 一面卡片墙：窄屏一列到底，宽屏一行摆四张 -->
    <XhGridItem>
      <div :style="labelStyle">cols = { base: 1, sm: 2, lg: 4 }</div>
      <XhGridRoot :cols="{ base: 1, sm: 2, lg: 4 }" gap="sm" style="margin-block-start: 6px">
        <XhGridItem v-for="c in cards" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <!-- 没写的档沿用比它窄的那一档：这里只在 md 换一次，md 往上都是三列 -->
    <XhGridItem>
      <div :style="labelStyle">只写两档：cols = { base: 2, md: 3 }</div>
      <XhGridRoot :cols="{ base: 2, md: 3 }" gap="sm" style="margin-block-start: 6px">
        <XhGridItem v-for="c in cards.slice(0, 6)" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <!-- 不写 base 就还是一列，从 lg 起才分栏 -->
    <XhGridItem>
      <div :style="labelStyle">不写 base：cols = { lg: 3 }</div>
      <XhGridRoot :cols="{ lg: 3 }" gap="sm" style="margin-block-start: 6px">
        <XhGridItem v-for="c in cards.slice(0, 3)" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
