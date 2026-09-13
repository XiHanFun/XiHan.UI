<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 number-field 相关实现。 -->

<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhNumberFieldRoot default-value="8" :min="0">
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>
</template>
