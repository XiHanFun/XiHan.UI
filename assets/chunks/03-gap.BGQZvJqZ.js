const n=`<!-- 间距 | 设置列与项目之间的间距 -->
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const items = ["设计", "开发", "测试", "发布"];
const gaps = ["sm", "lg"] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <div v-for="gap in gaps" :key="gap" style="inline-size: min(280px, 100%)">
      <div style="margin-block-end: 8px; color: var(--xh-fg-muted); font-size: 13px">{{ gap }}</div>
      <XhMasonry :columns="2" :gap="gap">
        <div
          v-for="(item, index) in items"
          :key="item"
          :style="\`padding: \${12 + index * 5}px 12px; border-radius: var(--xh-shape-control); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand)\`"
        >
          {{ item }}
        </div>
      </XhMasonry>
    </div>
  </div>
</template>
`;export{n as default};
