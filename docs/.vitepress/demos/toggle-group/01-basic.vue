<!-- 基础用法 | 单选分段控件：条目由 collection 铺开，root 是 radiogroup、条目是 radio；整组只占一个 Tab 位，进组后四个方向键都能走 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const aligns = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中" },
  { value: "right", label: "右对齐" },
];
</script>

<template>
  <!-- 不传 value 即非受控，default-value 只给初值 -->
  <XhToggleGroupRoot :collection="aligns" default-value="left" />
</template>
