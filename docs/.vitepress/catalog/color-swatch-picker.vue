<!-- 提供 color-swatch-picker 相关实现。 -->

<script setup lang="ts">
import { XhColorSwatchPickerRoot } from "@xihan-ui/vue";

const swatches = [
  { value: "#e11d48", label: "玫红" },
  { value: "#f59e0b", label: "琥珀" },
  { value: "#10b981", label: "翠绿" },
  { value: "#3b82f6", label: "天蓝" },
];
</script>

<template>
  <XhColorSwatchPickerRoot :swatches="swatches" default-value="#3b82f6" />
</template>
