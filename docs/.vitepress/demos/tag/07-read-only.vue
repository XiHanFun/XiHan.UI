<!-- 只读 | readOnly 只锁定关闭按钮：按钮留在原地但不可按下，标签本身不置灰；与 disabled 的区别只在标签本体的颜色 -->
<script setup lang="ts">
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhTagRoot variant="subtle" tone="brand" closable>
      <XhTagLabel>可摘掉</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>

    <XhTagRoot variant="subtle" tone="brand" closable read-only>
      <XhTagLabel>只读</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>

    <XhTagRoot variant="subtle" tone="brand" closable disabled>
      <XhTagLabel>禁用</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>
  </div>
</template>
