const n=`<!-- 语气 | 普通菜单行与展开项保持中性灰；tone 作用于触发器反馈和显式标记，不给展开项铺品牌色 -->
<script setup lang="ts">
import { XhMenubarRoot } from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "brand（缺省）" },
  { value: "neutral", label: "neutral" },
  { value: "success", label: "success" },
  { value: "warning", label: "warning" },
  { value: "danger", label: "danger" },
  { value: "info", label: "info" },
];

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
      { value: "save", label: "保存" },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "undo", label: "撤销" },
      { value: "redo", label: "重做" },
    ],
  },
];
<\/script>

<template>
  <!-- 菜单浮层往下落位，给容器底部留出它展开的空间 -->
  <div style="inline-size: 100%; display: grid; gap: 8px; padding-block-end: 160px">
    <div
      v-for="t in tones"
      :key="t.value"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 120px; flex: none">{{ t.label }}</span>
      <XhMenubarRoot :tone="t.value" :collection="menus" />
    </div>
  </div>
</template>
`;export{n as default};
