<script setup lang="ts">
import { XhPasswordInputControl, XhPasswordInputInput, XhPasswordInputLabel, XhPasswordInputRoot, XhPasswordInputVisibilityTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhPasswordInputRoot default-value="xihan-ui-2026" :translations="{ visibilityTriggerShow: '显示密码', visibilityTriggerHide: '隐藏密码', capsLockOn: '大写锁定已打开', strengthMeter: '密码强度' }">
    <XhPasswordInputLabel>密码</XhPasswordInputLabel>
    <XhPasswordInputControl>
      <XhPasswordInputInput style="inline-size: var(--xh-doc-catalog-w-narrow)" />
      <XhPasswordInputVisibilityTrigger />
    </XhPasswordInputControl>
  </XhPasswordInputRoot>
</template>
