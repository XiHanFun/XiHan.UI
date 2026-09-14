<script setup lang="ts">
import { XhListItem, XhListItemContent, XhListItemDescription, XhListItemTitle, XhListRoot } from "@xihan-ui/vue";

const people = [
  { name: "张三", desc: "技术部 · 前端" },
  { name: "李四", desc: "技术部 · 后端" },
];
</script>

<template>
  <XhListRoot style="inline-size: 220px; font-size: 13px">
    <XhListItem v-for="p in people" :key="p.name">
      <XhListItemContent>
        <XhListItemTitle>{{ p.name }}</XhListItemTitle>
        <XhListItemDescription>{{ p.desc }}</XhListItemDescription>
      </XhListItemContent>
    </XhListItem>
  </XhListRoot>
</template>
