var e=`<!-- 响应式排布 | 方向、对齐、分布与间距都可以按视口逐档书写：窄屏竖排、md 起横排并拉开间距 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const items = [
  { id: "设计", tone: "brand" },
  { id: "开发", tone: "info" },
  { id: "测试", tone: "success" },
] as const;
<\/script>

<template>
  <XhFlex
    :orientation="{ base: 'vertical', md: 'horizontal' }"
    :gap="{ base: 'sm', md: 'lg' }"
    style="inline-size: min(560px, 100%)"
  >
    <span v-for="item in items" :key="item.id" data-demo-block :data-tone="item.tone" style="flex: 1" />
  </XhFlex>
</template>
`;export{e as default};