<!-- 垂直布局 | 用于侧栏式内容导航 -->
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
  <XhTabsRoot default-value="account" orientation="vertical" variant="line" style="inline-size: 420px; max-inline-size: 100%">
    <XhTabsList aria-label="账户设置">
      <XhTabsTrigger value="account">账户</XhTabsTrigger>
      <XhTabsTrigger value="security">安全</XhTabsTrigger>
      <XhTabsTrigger value="notifications">通知</XhTabsTrigger>
      <XhTabsIndicator />
    </XhTabsList>

    <XhTabsContent value="account">管理账户资料与偏好。</XhTabsContent>
    <XhTabsContent value="security">配置密码与登录验证。</XhTabsContent>
    <XhTabsContent value="notifications">设置消息通知方式。</XhTabsContent>
  </XhTabsRoot>
</template>
