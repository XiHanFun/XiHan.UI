<!-- 变体 | 适配页面、表面与抬升区域 -->
<script setup lang="ts">
import { XhPageHeaderDescription, XhPageHeaderRoot, XhPageHeaderTitle } from "@xihan-ui/vue";

const variants = [
  { variant: undefined, label: "纯净", description: "融入页面背景" },
  { variant: "surface", label: "表面", description: "使用独立内容面" },
  { variant: "raised", label: "抬升", description: "突出当前页面" },
] as const;
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: min(720px, 100%)">
    <XhPageHeaderRoot v-for="v in variants" :key="v.label" :variant="v.variant" bordered>
      <XhPageHeaderTitle>{{ v.label }}</XhPageHeaderTitle>
      <XhPageHeaderDescription>{{ v.description }}</XhPageHeaderDescription>
    </XhPageHeaderRoot>
  </div>
</template>
