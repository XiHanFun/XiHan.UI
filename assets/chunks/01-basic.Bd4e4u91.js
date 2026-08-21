const n=`<!-- 基础用法 | 一排入口各带一张菜单，同时只展开一张；条目以 value 标识身份，禁用项方向键跳过也选不中 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhMenubarRoot } from "@xihan-ui/vue";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
      { value: "close", label: "关闭", disabled: true },
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
  {
    value: "view",
    label: "视图",
    items: [
      { value: "zoom-in", label: "放大" },
      { value: "zoom-out", label: "缩小" },
    ],
  },
];

const picked = ref("");

function onSelect(details: { menu: string; value: string }): void {
  picked.value = \`\${details.menu} / \${details.value}\`;
}
<\/script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenubarRoot :collection="menus" @select="onSelect" />

    <span>最近选中：{{ picked || "（无）" }}</span>
  </div>
</template>
`;export{n as default};
