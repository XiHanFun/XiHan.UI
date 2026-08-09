<!-- 手动激活 | activation-mode="manual" 时方向键只搬焦点，按 Enter 或空格才真的切面板 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot
    default-value="daily"
    activation-mode="manual"
    style="inline-size: 100%"
  >
    <XhTabsList>
      <XhTabsTrigger value="daily">日报</XhTabsTrigger>
      <XhTabsTrigger value="weekly">周报</XhTabsTrigger>
      <XhTabsTrigger value="monthly">月报</XhTabsTrigger>
    </XhTabsList>

    <XhTabsContent value="daily">日报面板</XhTabsContent>
    <XhTabsContent value="weekly">周报面板</XhTabsContent>
    <XhTabsContent value="monthly">月报面板</XhTabsContent>
  </XhTabsRoot>
</template>
