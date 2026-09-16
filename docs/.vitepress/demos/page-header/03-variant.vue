<!-- 形态 | ghost 贴在页面底色上，outline 为带描边的独立面，subtle 淡底 -->
<script setup lang="ts">
import { XhPageHeaderDescription, XhPageHeaderRoot, XhPageHeaderTitle } from "@xihan-ui/vue";

const variants = [
  { variant: "ghost", label: "贴底", description: "融入页面背景" },
  { variant: "outline", label: "描边", description: "使用带描边的独立内容面" },
  { variant: "subtle", label: "淡底", description: "以淡底区分页头区域" },
] as const;
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: min(720px, 100%)">
    <XhPageHeaderRoot v-for="v in variants" :key="v.label" :variant="v.variant">
      <XhPageHeaderTitle>{{ v.label }}</XhPageHeaderTitle>
      <XhPageHeaderDescription>{{ v.description }}</XhPageHeaderDescription>
    </XhPageHeaderRoot>
  </div>
</template>
