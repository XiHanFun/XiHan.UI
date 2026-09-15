<!-- 间距 | 设置栅格间距 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const groups = [
  { gap: "sm", label: "紧凑" },
  { gap: "md", label: "标准" },
  { gap: "lg", label: "宽松" },
] as const;
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: min(480px, 100%)">
    <div v-for="group in groups" :key="group.gap">
      <div style="margin-block-end: 6px; color: var(--xh-fg-muted); font-size: 13px">{{ group.label }}</div>
      <XhGridRoot :cols="3" :gap="group.gap">
        <XhGridItem
          v-for="item in 3"
          :key="item"
          data-demo-block
          data-tone="brand"
          style="block-size: 32px; --xh-demo-block-radius: var(--xh-shape-control)"
        />
      </XhGridRoot>
    </div>
  </div>
</template>
