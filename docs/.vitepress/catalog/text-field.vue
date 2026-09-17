<script setup lang="ts">
import { XhTextFieldControl, XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot placeholder="请输入内容">
    <XhTextFieldLabel>文本输入</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: var(--xh-doc-catalog-w-narrow)">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
