<!-- 基础用法 | 一个标签就是 root 加一段 label 文字；不写 closable 就没有关闭钮 -->
<script setup lang="ts">
import { XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const topics = ["前端", "无头内核", "可访问性"];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhTagRoot v-for="topic in topics" :key="topic">
      <XhTagLabel>{{ topic }}</XhTagLabel>
    </XhTagRoot>
  </div>
</template>
