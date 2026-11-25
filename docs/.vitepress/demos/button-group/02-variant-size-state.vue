<!-- 形态、尺寸与状态 | variant 与 tone 设置整组外观，size 设置整组尺寸，disabled 禁用整组按钮 -->
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
const sizes = ["sm", "md", "lg"] as const;
const views = ["日", "周", "月"];
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-6); justify-items: start">
    <div style="display: grid; gap: var(--xh-space-3); justify-items: start">
      <div v-for="item in variants" :key="item.label" style="display: grid; gap: var(--xh-space-2)">
        <span>{{ item.label }}</span>
        <XhButtonGroup :variant="item.variant" :tone="item.tone">
          <XhButton v-for="label in views" :key="label">{{ label }}</XhButton>
        </XhButtonGroup>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: var(--xh-space-4)">
      <XhButtonGroup v-for="s in sizes" :key="s" :size="s">
        <XhButton v-for="view in views" :key="view">{{ view }}</XhButton>
      </XhButtonGroup>
    </div>

    <XhButtonGroup disabled>
      <XhButton>照片</XhButton>
      <XhButton>视频</XhButton>
      <XhButton>更多</XhButton>
    </XhButtonGroup>
  </div>
</template>
