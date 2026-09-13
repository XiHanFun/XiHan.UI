<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 禁用 | 禁止编辑字段 -->
<script setup lang="ts">
import { XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhFieldRoot disabled style="inline-size: 280px;">
    <XhFieldLabel>登录账号</XhFieldLabel>
    <XhFieldControl>
      <input value="zhaifanhua" disabled>
    </XhFieldControl>
    <XhFieldDescription>账号创建后不可更改</XhFieldDescription>
  </XhFieldRoot>
</template>
