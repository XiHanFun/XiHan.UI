<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 平台 | 使用对应平台的修饰键格式 -->
<script setup lang="ts">
import { XhKbdGroup } from "@xihan-ui/vue";
</script>

<template>
  <XhKbdGroup :keys="['Mod', 'S']" platform="mac" />
  <XhKbdGroup :keys="['Mod', 'S']" platform="other" />
</template>
