<!-- 尺寸 | size 换的是标题字号与整块的上下留白，不写 size 即默认档 -->
<script setup lang="ts">
import { XhPageHeaderRoot, XhPageHeaderSubtitle, XhPageHeaderTitle } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column">
    <XhPageHeaderRoot v-for="s in sizes" :key="s.label" :size="s.size" bordered>
      <XhPageHeaderTitle>{{ s.label }}档标题</XhPageHeaderTitle>
      <XhPageHeaderSubtitle>副标题跟着标题排在同一行</XhPageHeaderSubtitle>
    </XhPageHeaderRoot>
  </div>
</template>
