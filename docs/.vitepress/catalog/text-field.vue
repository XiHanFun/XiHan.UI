<script setup lang="ts">
import { XhTextFieldControl, XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhTextFieldRoot placeholder="请输入内容">
    <XhTextFieldLabel>文本输入</XhTextFieldLabel>
    <XhTextFieldControl style="inline-size: 190px">
      <XhTextFieldInput />
    </XhTextFieldControl>
  </XhTextFieldRoot>
</template>
