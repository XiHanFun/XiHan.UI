<!-- 基础用法 | 交一组颜色数据就自动铺开；每格是一颗 radio，方向键在格子间移动并选中 -->
<script setup lang="ts">
import { XhColorSwatchPickerRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string | null>("#3b82f6");
const swatches = [
  { value: "#e11d48", label: "玫红" },
  { value: "#f59e0b", label: "琥珀" },
  { value: "#10b981", label: "翠绿" },
  { value: "#3b82f6", label: "天蓝" },
  { value: "#8b5cf6", label: "紫罗兰" },
  { value: "#64748b", label: "石板灰" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <XhColorSwatchPickerRoot v-model:value="value" :swatches="swatches" label="主题色" name="theme" />
    <span style="font-size: 13px">当前：<code>{{ value ?? "（未选）" }}</code></span>
  </div>
</template>
