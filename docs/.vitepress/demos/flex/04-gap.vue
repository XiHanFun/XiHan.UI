<!-- 间距 | 使用预设间距 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const groups = [
  { gap: "sm", label: "紧凑" },
  { gap: "md", label: "标准" },
  { gap: "lg", label: "宽松" },
] as const;
</script>

<template>
  <XhFlex orientation="vertical" gap="md">
    <XhFlex v-for="group in groups" :key="group.gap" align="center" gap="md">
      <span style="inline-size: 48px; color: var(--xh-fg-muted)">{{ group.label }}</span>
      <XhFlex :gap="group.gap">
        <span v-for="item in 3" :key="item" data-demo-block="square" data-tone="brand" style="inline-size: 28px; block-size: 28px" />
      </XhFlex>
    </XhFlex>
  </XhFlex>
</template>
