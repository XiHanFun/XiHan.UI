<!-- 尺寸 | size 只改变高度、内边距与字号，标签、切换按钮与大写锁定提示一起换档；不写即默认档 -->
<script setup lang="ts">
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPasswordInputRoot size="sm" default-value="hunter2">
    <XhPasswordInputLabel>sm</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput style="inline-size: 160px" />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>

  <XhPasswordInputRoot default-value="hunter2">
    <XhPasswordInputLabel>缺省</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput style="inline-size: 160px" />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>

  <XhPasswordInputRoot size="lg" default-value="hunter2">
    <XhPasswordInputLabel>lg</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput style="inline-size: 160px" />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
