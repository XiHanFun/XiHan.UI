<!-- 基础用法 | 单选分段控件：root 是 radiogroup、条目是 radio；整组只占一个 Tab 位，进组后四个方向键都能走 -->
<script setup lang="ts">
import { XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/vue";
</script>

<template>
  <!-- 不传 value 即非受控，default-value 只给初值 -->
  <XhToggleGroupRoot default-value="left">
    <XhToggleGroupItem value="left">左对齐</XhToggleGroupItem>
    <XhToggleGroupItem value="center">居中</XhToggleGroupItem>
    <XhToggleGroupItem value="right">右对齐</XhToggleGroupItem>
  </XhToggleGroupRoot>
</template>
