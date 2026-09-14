<!-- 尺寸 | 设置正文大小 -->
<script setup lang="ts">
import { XhTypographyParagraph, XhTypographyRoot } from "@xihan-ui/vue";

const sizes = [
  { size: "sm", label: "小号正文" },
  { size: undefined, label: "默认正文" },
  { size: "lg", label: "大号正文" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <XhTypographyRoot v-for="s in sizes" :key="s.label" :size="s.size">
      <XhTypographyParagraph>{{ s.label }}</XhTypographyParagraph>
    </XhTypographyRoot>
  </div>
</template>
