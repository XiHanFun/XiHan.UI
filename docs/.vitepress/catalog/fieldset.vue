<script setup lang="ts">
import { XhCheckbox, XhFieldsetDescription, XhFieldsetLegend, XhFieldsetRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhFieldsetRoot style="inline-size: var(--xh-doc-catalog-w)">
    <XhFieldsetLegend>通知方式</XhFieldsetLegend>
    <XhCheckbox default-checked>站内消息</XhCheckbox>
    <XhCheckbox>邮件</XhCheckbox>
    <XhFieldsetDescription>重要变更会照此通知你</XhFieldsetDescription>
  </XhFieldsetRoot>
</template>
