<!-- 列数 | columns 决定每行摆几组，一到六列；排版走 CSS Grid，不用表格 -->
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";

const rows = [
  { label: "姓名", value: "张三" },
  { label: "工号", value: "A-1024" },
  { label: "部门", value: "技术部" },
  { label: "岗位", value: "前端工程师" },
  { label: "入职", value: "2024-03-01" },
  { label: "座机", value: "8021" },
];
</script>

<template>
  <XhDescriptionsRoot :columns="3">
    <XhDescriptionsItem v-for="row in rows" :key="row.label">
      <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
      <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
    </XhDescriptionsItem>
  </XhDescriptionsRoot>
</template>
