<!-- 形态、尺寸与状态 | variant 设置整组外观，size 提供三种尺寸；状态落在单个选项上，禁用的那一项不可切换 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const options = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
const variants = ["solid", "subtle", "outline", "ghost"] as const;

const aligns = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中", disabled: true },
  { value: "right", label: "右对齐" },
];
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-6)">
    <div style="display: grid; gap: var(--xh-space-3); justify-items: start">
      <XhToggleGroupRoot
        v-for="variant in variants"
        :key="variant"
        :collection="options"
        default-value="week"
        :variant="variant"
      />
    </div>

    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-3)">
      <XhToggleGroupRoot :collection="options" default-value="day" size="sm" />
      <XhToggleGroupRoot :collection="options" default-value="week" />
      <XhToggleGroupRoot :collection="options" default-value="month" size="lg" />
    </div>

    <div style="display: flex">
      <XhToggleGroupRoot :collection="aligns" default-value="center" />
    </div>
  </div>
</template>
