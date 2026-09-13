<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 text field 相关实现。 -->

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
