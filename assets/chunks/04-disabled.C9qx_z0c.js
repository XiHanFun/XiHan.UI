const e=`<!-- 禁用 | 条目一律 aria-disabled 而非原生 disabled：点不动，但焦点落得上去，仍能当方向键的起点 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

// 禁用写在数据里，条目部件不必逐个再声明一遍
const aligns = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中", disabled: true },
  { value: "right", label: "右对齐" },
];

const plain = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中" },
  { value: "right", label: "右对齐" },
];
<\/script>

<template>
  <!-- 只禁其中一项：走方向键时它不被跳过，按 Enter / Space 也不切值 -->
  <XhToggleGroupRoot :collection="aligns" default-value="left" />

  <!-- 整组禁用：选中那一段仍看得出是当前值，只是改不动 -->
  <XhToggleGroupRoot :collection="plain" default-value="center" disabled />
</template>
`;export{e as default};
