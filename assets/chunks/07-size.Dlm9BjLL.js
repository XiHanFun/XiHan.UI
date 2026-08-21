const o=`<!-- 整组换一档尺寸 | 高度、内边距与字号各是一个组件令牌，写在 root 上由整组条目继承，不必逐个条目改 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

// 三个槽位一起换档，取的是控件尺寸家族里的同一档，跟同页别的控件对得上
const sm = [
  "--xh-toggle-group-item-h: var(--xh-control-h-sm)",
  "--xh-toggle-group-item-px: var(--xh-control-px-sm)",
  "--xh-toggle-group-item-font-size: var(--xh-font-size-sm)",
].join("; ");

const lg = [
  "--xh-toggle-group-item-h: var(--xh-control-h-lg)",
  "--xh-toggle-group-item-px: var(--xh-control-px-lg)",
  "--xh-toggle-group-item-font-size: var(--xh-font-size-lg)",
].join("; ");

const spans = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
<\/script>

<template>
  <XhToggleGroupRoot :collection="spans" default-value="day" :style="sm" />

  <!-- 不写就是缺省档 -->
  <XhToggleGroupRoot :collection="spans" default-value="week" />

  <XhToggleGroupRoot :collection="spans" default-value="month" :style="lg" />
</template>
`;export{o as default};
