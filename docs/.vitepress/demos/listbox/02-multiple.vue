<!-- 多选 | 允许选择多个选项 -->
<script setup lang="ts">
import { XhListboxRoot } from "@xihan-ui/vue";

const options = [
  { value: "design", label: "产品设计" },
  { value: "engineering", label: "工程研发" },
  { value: "marketing", label: "市场运营" },
  { value: "support", label: "客户支持" },
];
</script>

<template>
  <XhListboxRoot
    :collection="options"
    :default-value="['design']"
    label="参与团队"
    selection-mode="multiple"
    style="inline-size: min(100%, 300px)"
  />
</template>
