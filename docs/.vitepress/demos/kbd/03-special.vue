<!-- 平台键名 | 常用按键与跨平台组合由 Headless 统一格式化 -->
<script setup lang="ts">
import { XhKbd } from "@xihan-ui/vue";

const keys = [["Mod"], ["Shift"], ["ArrowUp"], ["Escape"], ["Mod", "Shift", "P"]];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <XhKbd v-for="item in keys" :key="item.join('-')" :keys="item" />
  </div>
</template>
