<!-- 变体 | 设置整组外观 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const variants = [
  { label: "主要", variant: "solid", tone: "brand" },
  { label: "次要", variant: "subtle", tone: "brand" },
  { label: "第三", variant: "subtle", tone: "neutral" },
  { label: "线框", variant: "outline", tone: undefined },
  { label: "幽灵", variant: "ghost", tone: undefined },
  { label: "危险", variant: "solid", tone: "danger" },
] as const;
const views = ["日", "周", "月"];
</script>

<template>
  <div style="display: grid; gap: 12px; justify-items: start">
    <div v-for="item in variants" :key="item.label" style="display: grid; gap: 6px">
      <span>{{ item.label }}</span>
      <XhButtonGroup :variant="item.variant" :tone="item.tone">
        <XhButton v-for="label in views" :key="label">{{ label }}</XhButton>
      </XhButtonGroup>
    </div>
  </div>
</template>
