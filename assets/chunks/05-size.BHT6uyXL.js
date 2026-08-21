const n=`<!-- 尺寸 | size 一档换掉 trigger 与菜单条目的字号与内边距，写在 root 上、浮层里的条目一并跟着变 -->
<script setup lang="ts">
import { XhMenubarRoot } from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "sm" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "lg" },
];

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
    ],
  },
  {
    value: "view",
    label: "视图",
    items: [
      { value: "zoom-in", label: "放大" },
      { value: "zoom-out", label: "缩小" },
    ],
  },
];
<\/script>

<template>
  <!-- 菜单浮层往下落位，给容器底部留出它展开的空间 -->
  <div style="inline-size: 100%; display: grid; gap: 12px; padding-block-end: 180px">
    <div
      v-for="s in sizes"
      :key="s.label"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 60px; flex: none">{{ s.label }}</span>
      <XhMenubarRoot :size="s.value" :collection="menus" />
    </div>
  </div>
</template>
`;export{n as default};
