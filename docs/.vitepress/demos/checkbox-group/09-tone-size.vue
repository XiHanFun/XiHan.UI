<!-- 语气与尺寸 | tone 换勾选方框的色族，size 换方框边长与文字档；两轴打在组容器上，条目自己不写 -->
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

const rows = [
  { tone: "success", size: "md", label: "success" },
  { tone: "warning", size: "md", label: "warning" },
  { tone: "danger", size: "md", label: "danger" },
  { tone: "brand", size: "sm", label: "sm" },
  { tone: "brand", size: "lg", label: "lg" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
    <XhCheckboxGroupRoot
      v-for="row in rows"
      :key="row.label"
      :collection="items"
      :default-value="['cheese']"
      :tone="row.tone"
      :size="row.size"
      :label="row.label"
    />
  </div>
</template>
