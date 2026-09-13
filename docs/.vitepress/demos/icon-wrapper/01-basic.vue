<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 显示带背景的图标 -->
<script setup lang="ts">
import { BellIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";
</script>

<template>
  <XhIconWrapper>
    <XhIcon :icon="BellIcon" />
  </XhIconWrapper>
</template>
