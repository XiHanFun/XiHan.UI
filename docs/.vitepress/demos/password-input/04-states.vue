<!-- 禁用与校验态 | disabled 连明暗切换一起停止，read-only 只锁定值、明暗照常切换，invalid 只标注不拦截输入 -->
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
  <XhPasswordInputRoot default-value="hunter2" disabled>
    <XhPasswordInputLabel>禁用</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>

  <XhPasswordInputRoot default-value="hunter2" read-only>
    <XhPasswordInputLabel>只读</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>

  <XhPasswordInputRoot default-value="123" invalid>
    <XhPasswordInputLabel>校验失败</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
