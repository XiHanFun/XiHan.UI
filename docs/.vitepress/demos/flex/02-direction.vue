<!-- 方向 | orientation 换主轴：horizontal 横排（缺省），vertical 竖排 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const boxStyle =
  "padding: 8px 14px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";
</script>

<template>
  <XhFlex orientation="vertical" gap="lg">
    <XhFlex orientation="vertical" gap="xs">
      <span :style="labelStyle">horizontal（缺省）</span>
      <XhFlex gap="sm">
        <span :style="boxStyle">甲</span>
        <span :style="boxStyle">乙</span>
        <span :style="boxStyle">丙</span>
      </XhFlex>
    </XhFlex>

    <XhFlex orientation="vertical" gap="xs">
      <span :style="labelStyle">vertical</span>
      <XhFlex orientation="vertical" gap="sm">
        <span :style="boxStyle">甲</span>
        <span :style="boxStyle">乙</span>
        <span :style="boxStyle">丙</span>
      </XhFlex>
    </XhFlex>
  </XhFlex>
</template>
