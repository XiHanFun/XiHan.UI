<!-- 禁用 | 条目一律 aria-disabled 而非原生 disabled：点不动，但焦点落得上去，仍能当方向键的起点 -->
<script setup lang="ts">
import { XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/vue";
</script>

<template>
  <!-- 只禁其中一项：走方向键时它不被跳过，按 Enter / Space 也不切值 -->
  <XhToggleGroupRoot default-value="left">
    <XhToggleGroupItem value="left">左对齐</XhToggleGroupItem>
    <XhToggleGroupItem value="center" disabled>居中</XhToggleGroupItem>
    <XhToggleGroupItem value="right">右对齐</XhToggleGroupItem>
  </XhToggleGroupRoot>

  <!-- 整组禁用：选中那一段仍看得出是当前值，只是改不动 -->
  <XhToggleGroupRoot default-value="center" disabled>
    <XhToggleGroupItem value="left">左对齐</XhToggleGroupItem>
    <XhToggleGroupItem value="center">居中</XhToggleGroupItem>
    <XhToggleGroupItem value="right">右对齐</XhToggleGroupItem>
  </XhToggleGroupRoot>
</template>
