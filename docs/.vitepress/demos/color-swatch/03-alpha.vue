<!-- 透明度 | 半透明颜色铺在棋盘格上，看得出这是带透明度的颜色；三种写法解析成同一个颜色 -->
<script setup lang="ts">
import { XhColorSwatch } from "@xihan-ui/vue";

// 同一个颜色的三种写法，与四档透明度
const values = ["#e11d48", "#e11d48bf", "rgba(225, 29, 72, 0.5)", "hsla(347, 77%, 50%, 0.25)"];
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
    <span v-for="value in values" :key="value" style="display: inline-flex; align-items: center; gap: 6px">
      <XhColorSwatch :value="value" size="lg" />
      <code style="font-size: 12px">{{ value }}</code>
    </span>
  </div>
</template>
