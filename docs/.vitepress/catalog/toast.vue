<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 toast 相关实现。 -->

<script setup lang="ts">
import {
  XhToastCloseTrigger,
  XhToastContent,
  XhToastDescription,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhToastRoot
    type="success"
    title="更改已保存"
    description="内容已同步到云端"
    :duration="0"
    :translations="{ close: '关闭' }"
  >
    <XhToastIndicator />
    <XhToastContent>
      <XhToastTitle />
      <XhToastDescription />
    </XhToastContent>
    <XhToastCloseTrigger />
  </XhToastRoot>
</template>
