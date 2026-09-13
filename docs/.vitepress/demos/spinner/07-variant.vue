<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 形态 | 默认渐隐弧，另有 ring 整圈与 dots 三点 -->
<script setup lang="ts">
import { XhSpinner } from "@xihan-ui/vue";
</script>

<template>
  <XhSpinner label="加载中" />
  <XhSpinner variant="ring" label="加载中" />
  <XhSpinner variant="dots" label="加载中" />
</template>
