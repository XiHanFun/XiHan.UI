const e=`<!-- 禁用 | 禁用走 aria-disabled 而非原生 disabled：禁用的入口仍聚焦得上、仍是方向键的起点，只是展不开菜单 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhMenubarRoot, XhSwitch } from "@xihan-ui/vue";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
    ],
  },
  // 单项禁用：整条没锁时，也只有这一项展不开
  {
    value: "edit",
    label: "编辑",
    disabled: true,
    items: [{ value: "undo", label: "撤销" }],
  },
  { value: "help", label: "帮助", items: [{ value: "about", label: "关于" }] },
];

const locked = ref(false);
<\/script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; padding-block-end: 140px">
    <XhMenubarRoot :disabled="locked" :collection="menus" />

    <label style="display: flex; align-items: center; gap: 8px">
      <XhSwitch v-model:checked="locked" />
      整条禁用（展开与选中都不再发生）
    </label>
  </div>
</template>
`;export{e as default};
