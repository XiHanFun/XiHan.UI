<!-- 基础用法 | 把颜色串画成一小块：颜色旁边写出串本身，看得见也读得出 -->
<script setup lang="ts">
import { XhColorSwatch } from "@xihan-ui/vue";

const colors = ["#e11d48", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
    <span v-for="color in colors" :key="color" style="display: inline-flex; align-items: center; gap: 6px">
      <XhColorSwatch :value="color" />
      <code style="font-size: 12px">{{ color }}</code>
    </span>
  </div>
</template>
