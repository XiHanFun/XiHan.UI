const n=`<!-- 用作状态标记 | 徽标不接收焦点、也不进 Tab 序列，状态语义靠文字本身表达 -->
<script setup lang="ts">
import { XhBadge } from "@xihan-ui/vue";

const rows = [
  { name: "构建 #182", state: "运行中", variant: "solid" as const },
  { name: "构建 #181", state: "已完成", variant: "subtle" as const },
  { name: "构建 #180", state: "已取消", variant: "outline" as const },
];
<\/script>

<template>
  <div style="display: grid; gap: 8px">
    <div v-for="r in rows" :key="r.name" style="display: flex; align-items: center; gap: 10px">
      <span style="min-width: 90px">{{ r.name }}</span>
      <XhBadge :variant="r.variant">{{ r.state }}</XhBadge>
    </div>
  </div>
</template>
`;export{n as default};
