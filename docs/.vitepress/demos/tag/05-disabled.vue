<!-- 禁用 | disabled 使标签留在原地但不可移除：关闭按钮仍占据位置，标签宽度不因禁用跳变 -->
<script setup lang="ts">
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhTagRoot variant="subtle" tone="brand" closable>
      <XhTagLabel>可摘掉</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>

    <XhTagRoot variant="subtle" tone="brand" closable disabled>
      <XhTagLabel>锁定的分类</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>

    <XhTagRoot variant="outline" disabled>
      <XhTagLabel>只读</XhTagLabel>
    </XhTagRoot>
  </div>
</template>
