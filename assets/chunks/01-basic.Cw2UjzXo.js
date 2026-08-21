const e=`<!-- 基础用法 | 渲染成 <time datetime>：文本给人看，datetime 给机器读，两者取自同一个墙钟 -->
<script setup lang="ts">
import { XhTime } from "@xihan-ui/vue";

// 三种写法都收：只写年月日的串按本地零点解读，不会掉到前一天去
const iso = "2026-08-11T09:30:05";
const dateOnly = "2026-08-11";
const stamp = new Date(2026, 7, 11, 9, 30, 5).getTime();
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <XhTime :value="iso" />
    <XhTime :value="dateOnly" />
    <XhTime :value="stamp" />
    <XhTime :value="new Date(2026, 7, 11, 9, 30, 5)" />
  </div>
</template>
`;export{e as default};
