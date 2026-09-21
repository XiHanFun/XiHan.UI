<!-- 注册表单 | 提供 name 后才参与提交，auto-complete 写为 new-password 密码管理器才会保存新密码而不是填入旧密码 -->
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
  <!-- 点表单的重置：值回到 default-value，明文也一并收起来 -->
  <form style="display: flex; align-items: flex-end; gap: 8px">
    <XhPasswordInputRoot name="new-password" auto-complete="new-password" default-value="" required>
      <XhPasswordInputLabel>设置新密码</XhPasswordInputLabel>
      <XhPasswordInputControl>
        <XhPasswordInputInput />
        <XhPasswordInputVisibilityTrigger />
      </XhPasswordInputControl>
    </XhPasswordInputRoot>
    <button type="reset">重置</button>
  </form>
</template>
