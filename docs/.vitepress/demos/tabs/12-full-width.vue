<!-- 等分铺满 | fullWidth 让标签按标签带的宽度平分，适合两三个并列入口撑满一栏 -->
<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="sign-in" full-width style="inline-size: 360px; max-inline-size: 100%">
    <XhTabsList aria-label="账号">
      <XhTabsTrigger value="sign-in">登录</XhTabsTrigger>
      <XhTabsTrigger value="sign-up">注册</XhTabsTrigger>
      <XhTabsIndicator />
    </XhTabsList>

    <XhTabsContent value="sign-in">用已有账号登录。</XhTabsContent>
    <XhTabsContent value="sign-up">创建一个新账号。</XhTabsContent>
  </XhTabsRoot>
</template>
