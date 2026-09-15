<!-- 图例与无效值 | label 为读屏提供有含义的名字；无法解析的串只剩棋盘格并标为无效 -->
<script setup lang="ts">
import { XhColorSwatch } from "@xihan-ui/vue";

const legend = [
  { label: "已完成", value: "#10b981" },
  { label: "进行中", value: "#3b82f6" },
  { label: "已逾期", value: "#e11d48" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <ul style="display: flex; gap: 16px; margin: 0; padding: 0; list-style: none">
      <li v-for="item in legend" :key="item.value" style="display: inline-flex; align-items: center; gap: 6px">
        <!-- 读屏念「已完成」，不念 #10b981 -->
        <XhColorSwatch :value="item.value" :label="item.label" size="sm" />
        <span style="font-size: 13px">{{ item.label }}</span>
      </li>
    </ul>
    <span style="display: inline-flex; align-items: center; gap: 6px">
      <!-- 颜色关键字不在支持的写法里：只画棋盘格，描边换成危险色，名字仍念作者写的串 -->
      <XhColorSwatch value="tomato" />
      <span style="font-size: 13px">tomato（无效：不认颜色关键字）</span>
    </span>
  </div>
</template>
