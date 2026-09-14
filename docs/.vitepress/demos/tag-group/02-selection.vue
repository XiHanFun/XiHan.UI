<!-- 可选中 | selectionMode 决定点一枚是替换还是加选；Ctrl/Cmd + A 全选 -->
<script setup lang="ts">
import { XhTagGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref<string[]>(["design"]);
const topics = [
  { value: "design", label: "设计" },
  { value: "a11y", label: "无障碍" },
  { value: "motion", label: "动效" },
  { value: "legacy", label: "已归档", disabled: true },
];
</script>

<template>
  <XhTagGroupRoot
    v-model:value="picked"
    :collection="topics"
    label="话题"
    selection-mode="multiple"
    variant="outline"
    tone="brand"
  />
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
