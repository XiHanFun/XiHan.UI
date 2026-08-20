<!-- 大写锁定提示 | 打开大写锁定再往框里敲一个字：提示显出来，读屏也会念一次；焦点离开输入框即熄灭 -->
<script setup lang="ts">
import {
  XhPasswordInputCapsLockIndicator,
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPasswordInputRoot
    placeholder="打开大写锁定再敲一个字"
    :translations="{ capsLockOn: '大写锁定已打开' }"
  >
    <XhPasswordInputLabel>密码</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput style="inline-size: 220px" />
      <!-- 节点留空：区里的文字由组件写，写的就是 translations.capsLockOn -->
      <XhPasswordInputCapsLockIndicator />
      <XhPasswordInputVisibilityTrigger>○</XhPasswordInputVisibilityTrigger>
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
