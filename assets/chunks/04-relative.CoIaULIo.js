const n=`<!-- 相对时间 | just now / n minutes ago 四档，超过三十天退回绝对日期；locale 只换用词，不给则跟随浏览器语言 -->
<script setup lang="ts">
import { XhTime } from "@xihan-ui/vue";

// 参照时刻给定后产出完全确定，不给则取当前时刻
const now = "2026-08-11T12:00:00";

const moments = [
  "2026-08-11T11:59:40",
  "2026-08-11T11:30:00",
  "2026-08-11T09:00:00",
  "2026-08-09T12:00:00",
  // 超过三十天，四档都装不下，改报绝对日期
  "2026-01-01T00:00:00",
];
<\/script>

<template>
  <div style="display: grid; grid-template-columns: auto auto; gap: 8px 24px; justify-content: start">
    <template v-for="moment in moments" :key="moment">
      <XhTime :value="moment" type="relative" :now="now" locale="en-US" />
      <XhTime :value="moment" type="relative" :now="now" locale="zh-CN" />
    </template>
  </div>
</template>
`;export{n as default};
