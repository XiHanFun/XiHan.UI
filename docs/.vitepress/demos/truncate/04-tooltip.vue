<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 原生提示 | 仅在内容溢出时显示完整文本 -->
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";
</script>

<template>
  <div style="inline-size: 240px; max-inline-size: 100%">
    <XhTruncate tooltip>浙江省杭州市余杭区文一西路 969 号 3 号楼 12 层 1203 室</XhTruncate>
  </div>
</template>
