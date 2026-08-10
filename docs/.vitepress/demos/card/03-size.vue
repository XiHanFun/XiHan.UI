<!-- 尺寸 | size 换的是各段的内边距与标题字号，不传 size 即默认档 -->
<script setup lang="ts">
import { XhCardBody, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
    <XhCardRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      variant="outline"
      style="inline-size: 200px"
    >
      <XhCardHeader>
        <XhCardTitle>{{ s.label }}</XhCardTitle>
      </XhCardHeader>
      <XhCardBody>正文。</XhCardBody>
    </XhCardRoot>
  </div>
</template>
