<!-- 基础用法 | 一组字段收进原生 fieldset：legend 是这一组的名字，说明文案自动派生 id 并接进 aria-describedby -->
<script setup lang="ts">
import { XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhFieldsetRoot style="inline-size: 320px;">
    <XhFieldsetLegend>通知方式</XhFieldsetLegend>
    <label style="display: flex; gap: 8px; align-items: center;">
      <input type="checkbox" checked />
      站内消息
    </label>
    <label style="display: flex; gap: 8px; align-items: center;">
      <input type="checkbox" />
      邮件
    </label>
    <label style="display: flex; gap: 8px; align-items: center;">
      <input type="checkbox" />
      短信
    </label>
    <XhFieldsetDescription>至少保留一种，重要变更会照此通知你</XhFieldsetDescription>
  </XhFieldsetRoot>
</template>
