const e=`<!-- 形态、语气与尺寸 | 三轴打在 root 上沿继承流下发给每一段，条目自己不写任何一档 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const spans = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
    <XhToggleGroupRoot :collection="spans" default-value="day" variant="solid" />
    <XhToggleGroupRoot :collection="spans" default-value="day" variant="outline" />
    <XhToggleGroupRoot :collection="spans" default-value="day" variant="ghost" />

    <XhToggleGroupRoot :collection="spans" default-value="week" tone="neutral" />
    <XhToggleGroupRoot :collection="spans" default-value="week" tone="success" />

    <XhToggleGroupRoot :collection="spans" default-value="month" size="sm" />
    <XhToggleGroupRoot :collection="spans" default-value="month" size="lg" />
  </div>
</template>
`;export{e as default};
