const e=`<!-- 尺寸 | size 换标签的高度、内边距与字号，不传 size 即默认档 -->
<script setup lang="ts">
import { XhTabsRoot } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

const tabs = [
  { value: "overview", label: "概览" },
  { value: "usage", label: "用法" },
  { value: "api", label: "API" },
];
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
    <div v-for="s in sizes" :key="s.label">
      <div style="margin-block-end: 8px; font-size: 12px">{{ s.label }}</div>
      <XhTabsRoot
        :size="s.size"
        :collection="tabs"
        default-value="overview"
        style="inline-size: 100%"
      >
        <template #panel="node">{{ node.label }}面板</template>
      </XhTabsRoot>
    </div>
  </div>
</template>
`;export{e as default};
