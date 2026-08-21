const a=`<!-- 仪表盘 | variant="dashboard" 在环上留一个缺口，gapDegree 与 gapPosition 决定它多大、朝哪 -->
<script setup lang="ts">
import { XhProgress } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
    <XhProgress variant="dashboard" :value="64" />
    <XhProgress variant="dashboard" :value="64" :gap-degree="140" />
    <XhProgress variant="dashboard" :value="64" gap-position="top" tone="warning" />
    <XhProgress variant="dashboard" :value="64" gap-position="left" :gap-degree="40" />
  </div>
</template>
`;export{a as default};
