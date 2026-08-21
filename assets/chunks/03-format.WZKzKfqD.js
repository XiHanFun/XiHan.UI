const n=`<!-- 自定义格式串 | 记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s，只改看到的文本，datetime 不跟着变 -->
<script setup lang="ts">
import { XhTime } from "@xihan-ui/vue";

const value = "2026-08-05T09:03:07";

// 两位记号补零，一位记号不补；记号之外的字符原样留着
const patterns = [
  "YYYY-MM-DD HH:mm:ss",
  "YYYY 年 M 月 D 日",
  "M/D H:mm",
  "YY.MM.DD",
];
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <div v-for="pattern in patterns" :key="pattern">
      <code style="margin-inline-end: 12px">{{ pattern }}</code>
      <XhTime :value="value" :format="pattern" />
    </div>
  </div>
</template>
`;export{n as default};
