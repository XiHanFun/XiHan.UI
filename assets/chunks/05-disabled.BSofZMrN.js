const a=`<!-- 禁用 | disabled 让标签留在原地却摘不掉：关闭钮仍占着位置，标签宽度不因禁用跳变 -->
<script setup lang="ts">
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/vue";
<\/script>

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
`;export{a as default};
