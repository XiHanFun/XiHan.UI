<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 一个自己往上走的秒表：不写内容时组件铺开时、分、秒三段，auto-start 让它挂载即开跑 -->
<script setup lang="ts">
import { XhTimerRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhTimerRoot auto-start />
</template>
